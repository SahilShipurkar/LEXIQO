import { Injectable } from '@nestjs/common';
import { ProgrammingLanguage, SubmissionVerdict } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export interface ExecutionResult {
    status: SubmissionVerdict;
    passedCount: number;
    totalCount: number;
    runtimeMs: number;
    memoryKb: number;
    output?: string;
    errorMessage?: string;
    testCaseResults: TestCaseResult[];
}

export interface TestCaseResult {
    testCaseId: string;
    input: string;
    expectedOutput: string;
    actualOutput: string;
    status: 'PASS' | 'FAIL' | 'ERROR';
    runtimeMs: number;
}

@Injectable()
export class CodeExecutionService {
    private readonly timeoutMs = 5000; // 5 seconds timeout

    async runOnSampleTests(
        language: ProgrammingLanguage,
        sourceCode: string,
        testCases: any[],
        problemSlug?: string
    ): Promise<ExecutionResult> {
        return this.executeAll(language, sourceCode, testCases, problemSlug);
    }

    async submitAgainstAllTests(
        language: ProgrammingLanguage,
        sourceCode: string,
        testCases: any[],
        problemSlug?: string
    ): Promise<ExecutionResult> {
        return this.executeAll(language, sourceCode, testCases, problemSlug);
    }

    private async executeAll(
        language: ProgrammingLanguage,
        sourceCode: string,
        testCases: any[],
        problemSlug?: string
    ): Promise<ExecutionResult> {
        const results: TestCaseResult[] = [];
        let totalRuntime = 0;
        let finalStatus: SubmissionVerdict = SubmissionVerdict.ACCEPTED;
        let errorMessage = '';

        const tempDir = path.join(os.tmpdir(), `lexiqo-${uuidv4()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        try {
            // 1. Wrap and Prepare Code
            const wrappedCode = this.wrapCode(language, sourceCode, problemSlug);
            const fileName = this.getFileName(language);
            const filePath = path.join(tempDir, fileName);
            fs.writeFileSync(filePath, wrappedCode);

            // 2. Pre-compile if necessary
            const compilationResult = this.compile(language, tempDir, fileName);
            if (compilationResult.error) {
                return {
                    status: SubmissionVerdict.COMPILATION_ERROR,
                    passedCount: 0,
                    totalCount: testCases.length,
                    runtimeMs: 0,
                    memoryKb: 0,
                    errorMessage: compilationResult.error,
                    testCaseResults: testCases.map(tc => ({
                        testCaseId: tc.id,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: '',
                        status: 'ERROR',
                        runtimeMs: 0
                    }))
                };
            }

            // 3. Run each test case
            for (const tc of testCases) {
                const start = Date.now();
                const runResult = this.run(language, tempDir, fileName, tc.input);
                const runtime = Date.now() - start;
                totalRuntime += runtime;

                if (runResult.timeout) {
                    results.push({
                        testCaseId: tc.id,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: 'Time Limit Exceeded',
                        status: 'ERROR',
                        runtimeMs: runtime
                    });
                    finalStatus = SubmissionVerdict.TIME_LIMIT_EXCEEDED;
                    continue;
                }

                if (runResult.error) {
                    results.push({
                        testCaseId: tc.id,
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                        actualOutput: runResult.error,
                        status: 'ERROR',
                        runtimeMs: runtime
                    });
                    finalStatus = SubmissionVerdict.RUNTIME_ERROR;
                    errorMessage = runResult.error;
                    continue;
                }

                const actualOutput = runResult.stdout.trim();
                const expectedOutput = tc.expectedOutput.trim();
                const passed = this.compareOutputs(actualOutput, expectedOutput);

                results.push({
                    testCaseId: tc.id,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    actualOutput,
                    status: passed ? 'PASS' : 'FAIL',
                    runtimeMs: runtime
                });

                if (!passed && finalStatus === SubmissionVerdict.ACCEPTED) {
                    finalStatus = SubmissionVerdict.WRONG_ANSWER;
                }
            }
        } catch (err) {
            errorMessage = err.message;
            finalStatus = SubmissionVerdict.RUNTIME_ERROR;
        } finally {
            // Clean up
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch (e) { }
        }

        const passedCount = results.filter(r => r.status === 'PASS').length;

        return {
            status: finalStatus,
            passedCount,
            totalCount: testCases.length,
            runtimeMs: testCases.length > 0 ? Math.floor(totalRuntime / testCases.length) : 0,
            memoryKb: Math.floor(Math.random() * 1000) + 500, // Simulation for memory
            errorMessage,
            testCaseResults: results
        };
    }

    private compareOutputs(actual: string, expected: string): boolean {
        // Normalize: remove whitespace to be more lenient with formatting
        const normActual = actual.replace(/\s+/g, '').toLowerCase();
        const normExpected = expected.replace(/\s+/g, '').toLowerCase();
        
        // Also handle cases like [0, 1] vs [0,1]
        if (normActual === normExpected) return true;
        
        // Handle boolean values
        if ((actual === 'true' && expected === 'true') || (actual === 'false' && expected === 'false')) return true;

        return false;
    }

    private readonly DRIVERS = {
        'two-sum': {
            [ProgrammingLanguage.JAVASCRIPT]: (code) => `${code}\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim().split('\\n');\nconst nums = JSON.parse(input[0]);\nconst target = parseInt(input[1]);\nconsole.log(JSON.stringify(twoSum(nums, target)));`,
            [ProgrammingLanguage.PYTHON]: (code) => `import sys, json\nfrom typing import List, Optional\n${code}\ninput_data = sys.stdin.read().splitlines()\nif len(input_data) >= 2:\n    nums = json.loads(input_data[0])\n    target = int(input_data[1])\n    print(json.dumps(Solution().twoSum(nums, target)))`,
            [ProgrammingLanguage.CPP]: (code) => `#include <iostream>\n#include <vector>\n#include <string>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n${code}\nvector<int> pv(string s){ s.erase(remove(s.begin(),s.end(),'['),s.end()); s.erase(remove(s.begin(),s.end(),']'),s.end()); replace(s.begin(),s.end(),',',' '); stringstream ss(s); vector<int> r; int n; while(ss>>n)r.push_back(n); return r; }\nint main(){ string l1, l2; if(!getline(cin,l1))return 0; if(!getline(cin,l2))return 0; vector<int> nums=pv(l1); int target=stoi(l2); Solution sol; vector<int> res=sol.twoSum(nums,target); cout << "[" << res[0] << "," << res[1] << "]" << endl; return 0; }`,
            [ProgrammingLanguage.JAVA]: (code) => `import java.util.*;\nimport java.io.*;\n${code}\npublic class Main { public static void main(String[] args) { Scanner sc = new Scanner(System.in); if(!sc.hasNext())return; String l1=sc.nextLine(); if(!sc.hasNext())return; String l2=sc.nextLine(); String str=l1.replace("[","").replace("]","").replace(" ",""); String[] parts=str.split(","); int[] nums=new int[parts.length]; for(int i=0;i<parts.length;i++)nums[i]=Integer.parseInt(parts[i]); int target=Integer.parseInt(l2.trim()); Solution sol=new Solution(); int[] res=sol.twoSum(nums,target); System.out.println("["+res[0]+","+res[1]+"]"); } }`
        },
        'valid-parentheses': {
            [ProgrammingLanguage.JAVASCRIPT]: (code) => `${code}\nconst fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim().replace(/^"|"$/g, '');\nconsole.log(isValid(s));`,
            [ProgrammingLanguage.PYTHON]: (code) => `import sys\nfrom typing import List, Optional\n${code}\ns = sys.stdin.read().strip().replace('"', '')\nprint(str(Solution().isValid(s)).toLowerCase())`,
        },
        'climbing-stairs': {
            [ProgrammingLanguage.JAVASCRIPT]: (code) => `${code}\nconst fs = require('fs');\nconst n = parseInt(fs.readFileSync(0, 'utf8').trim());\nconsole.log(climbStairs(n));`,
            [ProgrammingLanguage.PYTHON]: (code) => `import sys\nfrom typing import List, Optional\n${code}\nn = int(sys.stdin.read().strip())\nprint(Solution().climbStairs(n))`,
        },
        'binary-search': {
            [ProgrammingLanguage.JAVASCRIPT]: (code) => `${code}\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim().split('\\n');\nconst nums = JSON.parse(input[0]);\nconst target = parseInt(input[1]);\nconsole.log(search(nums, target));`,
            [ProgrammingLanguage.PYTHON]: (code) => `import sys, json\nfrom typing import List, Optional\n${code}\ninput_data = sys.stdin.read().splitlines()\nnums = json.loads(input_data[0])\ntarget = int(input_data[1])\nprint(Solution().search(nums, target))`,
        },
        'maximum-subarray': {
            [ProgrammingLanguage.JAVASCRIPT]: (code) => `${code}\nconst fs = require('fs');\nconst nums = JSON.parse(fs.readFileSync(0, 'utf8').trim());\nconsole.log(maxSubArray(nums));`,
            [ProgrammingLanguage.PYTHON]: (code) => `import sys, json\nfrom typing import List, Optional\n${code}\nnums = json.loads(sys.stdin.read().strip())\nprint(Solution().maxSubArray(nums))`,
        },
        'reverse-string': {
            [ProgrammingLanguage.JAVASCRIPT]: (code) => `${code}\nconst fs = require('fs');\nconst s = JSON.parse(fs.readFileSync(0, 'utf8').trim());\nreverseString(s);\nconsole.log(JSON.stringify(s));`,
            [ProgrammingLanguage.PYTHON]: (code) => `import sys, json\nfrom typing import List, Optional\n${code}\ns = json.loads(sys.stdin.read().strip())\nSolution().reverseString(s)\nprint(json.dumps(s))`,
        }
    };

    private wrapCode(language: ProgrammingLanguage, code: string, slug?: string): string {
        if (slug && this.DRIVERS[slug] && this.DRIVERS[slug][language]) {
            return this.DRIVERS[slug][language](code);
        }
        
        // Generic wrappers for other problems
        if (language === ProgrammingLanguage.PYTHON && !code.includes('import sys')) {
            return `import sys, json\nfrom typing import List, Optional\n${code}`;
        }

        return code;
    }

    private getFileName(language: ProgrammingLanguage): string {
        switch (language) {
            case ProgrammingLanguage.JAVASCRIPT: return 'solution.js';
            case ProgrammingLanguage.PYTHON: return 'solution.py';
            case ProgrammingLanguage.CPP: return 'solution.cpp';
            case ProgrammingLanguage.C: return 'solution.c';
            case ProgrammingLanguage.JAVA: return 'Main.java';
            default: return 'solution.txt';
        }
    }

    private compile(language: ProgrammingLanguage, dir: string, fileName: string): { error?: string } {
        const filePath = path.join(dir, fileName);
        switch (language) {
            case ProgrammingLanguage.CPP: {
                const res = spawnSync('g++', [filePath, '-o', path.join(dir, 'solution.exe')], { encoding: 'utf8' });
                if (res.status !== 0) return { error: res.stderr };
                break;
            }
            case ProgrammingLanguage.C: {
                const res = spawnSync('gcc', [filePath, '-o', path.join(dir, 'solution.exe')], { encoding: 'utf8' });
                if (res.status !== 0) return { error: res.stderr };
                break;
            }
            case ProgrammingLanguage.JAVA: {
                const res = spawnSync('javac', [filePath], { encoding: 'utf8' });
                if (res.status !== 0) return { error: res.stderr };
                break;
            }
        }
        return {};
    }

    private run(language: ProgrammingLanguage, dir: string, fileName: string, input: string): { stdout: string, stderr: string, error?: string, timeout?: boolean } {
        const filePath = path.join(dir, fileName);
        let cmd = '';
        let args: string[] = [];

        switch (language) {
            case ProgrammingLanguage.JAVASCRIPT:
                cmd = 'node';
                args = [filePath];
                break;
            case ProgrammingLanguage.PYTHON:
                cmd = 'python';
                args = [filePath];
                break;
            case ProgrammingLanguage.CPP:
            case ProgrammingLanguage.C:
                cmd = path.join(dir, 'solution.exe');
                args = [];
                break;
            case ProgrammingLanguage.JAVA:
                cmd = 'java';
                args = ['-cp', dir, 'Main'];
                break;
        }

        const res = spawnSync(cmd, args, {
            input,
            encoding: 'utf8',
            timeout: this.timeoutMs,
            maxBuffer: 1024 * 1024, // 1MB
        });

        if (res.error) {
            if ((res.error as any).code === 'ETIMEDOUT') return { stdout: '', stderr: '', timeout: true };
            return { stdout: '', stderr: '', error: res.error.message };
        }

        if (res.status !== 0) {
            return { stdout: res.stdout || '', stderr: res.stderr || '', error: res.stderr || 'Runtime Error' };
        }

        return { stdout: res.stdout, stderr: res.stderr };
    }
}
