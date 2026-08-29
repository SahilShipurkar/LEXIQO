import { PrismaClient, CodingDifficulty, ProgrammingLanguage } from '@prisma/client';

export async function seedCoding(prisma: PrismaClient) {
    console.log('🌱 Seeding upgraded coding problems...');

    const problems = [
        {
            title: 'Two Sum',
            slug: 'two-sum',
            difficulty: CodingDifficulty.EASY,
            description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
            shortDescription: 'Find two numbers that add up to a target value.',
            constraints: '- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.',
            inputFormat: '`nums`: An array of integers.\n`target`: An integer.',
            outputFormat: 'An array of two integers representing the indices.',
            estimatedMinutes: 15,
            editorial: 'To solve this efficiently, we can use a Hash Map. As we iterate through the array, we check if the complement (target - current element) exists in our map. If it does, we found our pair. If not, we add the current element and its index to the map.',
            tags: ['Arrays', 'Hash Table'],
            examples: [
                {
                    input: 'nums = [2,7,11,15], target = 9',
                    output: '[0,1]',
                    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
                    order: 1,
                },
            ],
            hints: [
                { content: 'Try to use a hash map to store the values you have seen so far.', order: 1 },
                { content: 'For each number, the complement is target - number.', order: 2 },
            ],
            testCases: [
                { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isSample: true, isHidden: false },
                { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isSample: true, isHidden: false },
                { input: '[3,3]\n6', expectedOutput: '[0,1]', isSample: false, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.C, fileName: 'solution.c', starterCode: '#include <stdio.h>\n#include <stdlib.h>\n\n/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}' },
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};' },
                { language: ProgrammingLanguage.JAVA, fileName: 'Main.java', starterCode: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}' },
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ' },
                { language: ProgrammingLanguage.JAVASCRIPT, fileName: 'solution.js', starterCode: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};' },
            ],
        },
        {
            title: 'Valid Parentheses',
            slug: 'valid-parentheses',
            difficulty: CodingDifficulty.EASY,
            description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
            shortDescription: 'Check if the parentheses in a string are balanced.',
            constraints: '- 1 <= s.length <= 10^4\n- `s` consists of parentheses only `()[]{}`.',
            inputFormat: '`s`: A string of parentheses.',
            outputFormat: 'Boolean value.',
            estimatedMinutes: 10,
            editorial: 'Use a stack to track open brackets. For every closing bracket, check if it matches the top of the stack.',
            tags: ['String', 'Stack'],
            examples: [
                { input: 's = "()"', output: 'true', order: 1 },
            ],
            hints: [
                { content: 'A stack is perfect for this problem as it follows LIFO.', order: 1 },
            ],
            testCases: [
                { input: '"()"', expectedOutput: 'true', isSample: true, isHidden: false },
                { input: '"()[]{}"', expectedOutput: 'true', isSample: true, isHidden: false },
                { input: '"(]"', expectedOutput: 'false', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.C, fileName: 'solution.c', starterCode: 'bool isValid(char * s) {\n    \n}' },
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};' },
                { language: ProgrammingLanguage.JAVA, fileName: 'Main.java', starterCode: 'class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}' },
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        ' },
                { language: ProgrammingLanguage.JAVASCRIPT, fileName: 'solution.js', starterCode: '/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};' },
            ],
        },
        {
            title: 'Climbing Stairs',
            slug: 'climbing-stairs',
            difficulty: CodingDifficulty.EASY,
            description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
            shortDescription: 'How many ways to reach the top?',
            constraints: '1 <= n <= 45',
            estimatedMinutes: 15,
            editorial: 'This is a classic dynamic programming problem. The number of ways to reach step n is the sum of ways to reach n-1 and n-2. This follows the Fibonacci sequence.',
            tags: ['Math', 'Dynamic Programming'],
            examples: [
                { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps', order: 1 },
            ],
            hints: [
                { content: 'Think about how you can reach the n-th step from previous steps.', order: 1 },
            ],
            testCases: [
                { input: '2', expectedOutput: '2', isSample: true, isHidden: false },
                { input: '3', expectedOutput: '3', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.C, fileName: 'solution.c', starterCode: 'int climbStairs(int n) {\n    \n}' },
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};' },
                { language: ProgrammingLanguage.JAVA, fileName: 'Main.java', starterCode: 'class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}' },
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        ' },
                { language: ProgrammingLanguage.JAVASCRIPT, fileName: 'solution.js', starterCode: 'var climbStairs = function(n) {\n    \n};' },
            ],
        },
        {
            title: 'Binary Search',
            slug: 'binary-search',
            difficulty: CodingDifficulty.EASY,
            description: 'Given a sorted array `nums` and a `target`, return the index of the target if it exists, otherwise -1.',
            shortDescription: 'Standard Binary Search implementation.',
            estimatedMinutes: 10,
            editorial: 'Use two pointers, low and high. Calculate mid = (low + high) / 2 and narrow the range.',
            tags: ['Array', 'Binary Search'],
            examples: [
                { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', order: 1 },
            ],
            hints: [
                { content: 'Array is sorted. Use it to your advantage.', order: 1 },
            ],
            testCases: [
                { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};' },
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        ' },
                { language: ProgrammingLanguage.JAVASCRIPT, fileName: 'solution.js', starterCode: 'var search = function(nums, target) {\n    \n};' },
            ],
        },
        {
            title: 'Maximum Subarray',
            slug: 'maximum-subarray',
            difficulty: CodingDifficulty.MEDIUM,
            description: 'Find the contiguous subarray with the largest sum and return its sum.',
            shortDescription: 'Kadane\'s Algorithm practice.',
            estimatedMinutes: 20,
            editorial: 'Use Kadane\'s Algorithm to keep track of the current maximum and the global maximum.',
            tags: ['Array', 'Dynamic Programming'],
            examples: [
                { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', order: 1 },
            ],
            hints: [
                { content: 'At each index, you can either start a new subarray or continue the existing one.', order: 1 },
            ],
            testCases: [
                { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};' },
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        ' },
                { language: ProgrammingLanguage.JAVASCRIPT, fileName: 'solution.js', starterCode: 'var maxSubArray = function(nums) {\n    \n};' },
            ],
        },
        {
            title: 'Linked List Cycle',
            slug: 'linked-list-cycle',
            difficulty: CodingDifficulty.EASY,
            description: 'Determine if a linked list has a cycle.',
            shortDescription: 'Fast and Slow pointer technique.',
            tags: ['Linked List', 'Two Pointers'],
            examples: [
                { input: 'head = [3,2,0,-4], pos = 1', output: 'true', order: 1 },
            ],
            hints: [
                { content: 'Imagine two runners on a track. If there is a cycle, the faster one will eventually catch the slower one.', order: 1 },
            ],
            testCases: [
                { input: '[3,2,0,-4]\n1', expectedOutput: 'true', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.JAVA, fileName: 'Main.java', starterCode: 'public class Solution {\n    public boolean hasCycle(ListNode head) {\n        \n    }\n}' },
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        ' },
            ],
        },
        {
            title: 'Reverse String',
            slug: 'reverse-string',
            difficulty: CodingDifficulty.EASY,
            description: 'Reverse a character array in-place.',
            shortDescription: 'Basic character array manipulation.',
            tags: ['Two Pointers', 'String'],
            examples: [
                { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', order: 1 },
            ],
            testCases: [
                { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};' },
                { language: ProgrammingLanguage.JAVASCRIPT, fileName: 'solution.js', starterCode: 'var reverseString = function(s) {\n    \n};' },
            ],
        },
        {
            title: 'Merge Intervals',
            slug: 'merge-intervals',
            difficulty: CodingDifficulty.MEDIUM,
            description: 'Given an array of intervals, merge all overlapping intervals.',
            shortDescription: 'Sort and merge intervals.',
            tags: ['Array', 'Sorting'],
            examples: [
                { input: '[[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', order: 1 },
            ],
            testCases: [
                { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        \n    }\n};' }
            ]
        },
        {
            title: 'Longest Substring Without Repeating Characters',
            slug: 'longest-substring-without-repeating-characters',
            difficulty: CodingDifficulty.MEDIUM,
            description: 'Find the length of the longest substring without repeating characters.',
            shortDescription: 'Sliding window technique.',
            tags: ['Hash Table', 'String', 'Sliding Window'],
            examples: [
                { input: 's = "abcabcbb"', output: '3', order: 1 },
            ],
            testCases: [
                { input: '"abcabcbb"', expectedOutput: '3', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        ' }
            ]
        },
        {
            title: 'Product of Array Except Self',
            slug: 'product-of-array-except-self',
            difficulty: CodingDifficulty.MEDIUM,
            description: 'Return an array such that element i is the product of all elements except nums[i]. Do it in O(n) without division.',
            shortDescription: 'Prefix and Suffix products.',
            tags: ['Array', 'Math'],
            examples: [
                { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', order: 1 },
            ],
            testCases: [
                { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};' }
            ]
        },
        {
            title: 'Fibonacci Number',
            slug: 'fibonacci-number',
            difficulty: CodingDifficulty.EASY,
            description: 'Calculate F(n) where F(n) = F(n-1) + F(n-2).',
            shortDescription: 'Recursion and DP.',
            tags: ['Math', 'Dynamic Programming'],
            examples: [
                { input: 'n = 2', output: '1', order: 1 },
            ],
            testCases: [
                { input: '2', expectedOutput: '1', isSample: true, isHidden: false },
                { input: '3', expectedOutput: '2', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def fib(self, n: int) -> int:\n        ' }
            ]
        },
        {
            title: 'Move Zeroes',
            slug: 'move-zeroes',
            difficulty: CodingDifficulty.EASY,
            description: 'Move all zeroes to the end of the array while maintaining the order of non-zero elements.',
            shortDescription: 'Two pointers strategy.',
            tags: ['Array', 'Two Pointers'],
            examples: [
                { input: 'nums = [0,1,0,3,12]', output: '[1,3,12,0,0]', order: 1 },
            ],
            testCases: [
                { input: '[0,1,0,3,12]', expectedOutput: '[1,3,12,0,0]', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n        \n    }\n};' }
            ]
        },
        {
            title: 'Best Time to Buy and Sell Stock',
            slug: 'best-time-to-buy-and-sell-stock',
            difficulty: CodingDifficulty.EASY,
            description: 'Find the maximum profit you can achieve from one transaction.',
            shortDescription: 'One pass optimization.',
            tags: ['Array', 'Dynamic Programming'],
            examples: [
                { input: 'prices = [7,1,5,3,6,4]', output: '5', order: 1 },
            ],
            testCases: [
                { input: '[7,1,5,3,6,4]', expectedOutput: '5', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.PYTHON, fileName: 'solution.py', starterCode: 'class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        ' }
            ]
        },
        {
            title: 'Invert Binary Tree',
            slug: 'invert-binary-tree',
            difficulty: CodingDifficulty.EASY,
            description: 'Invert a binary tree (mirror it).',
            shortDescription: 'Recursion on trees.',
            tags: ['Tree', 'Binary Tree'],
            examples: [
                { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', order: 1 },
            ],
            testCases: [
                { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4,7,2,9,6,3,1]', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.CPP, fileName: 'solution.cpp', starterCode: 'class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        \n    }\n};' }
            ]
        },
        {
            title: 'Validate Binary Search Tree',
            slug: 'validate-binary-search-tree',
            difficulty: CodingDifficulty.MEDIUM,
            description: 'Determine if a binary tree is a valid BST.',
            shortDescription: 'Tree traversal with bounds.',
            tags: ['Tree', 'Binary Search Tree'],
            examples: [
                { input: 'root = [2,1,3]', output: 'true', order: 1 },
            ],
            testCases: [
                { input: '[2,1,3]', expectedOutput: 'true', isSample: true, isHidden: false },
            ],
            starterTemplates: [
                { language: ProgrammingLanguage.JAVA, fileName: 'Main.java', starterCode: 'class Solution {\n    public boolean isValidBST(TreeNode root) {\n        \n    }\n}' }
            ]
        }
    ];

    for (const prob of problems) {
        const { tags, examples, hints, testCases, starterTemplates, ...probData } = prob;

        const createdProblem = await prisma.codingProblem.upsert({
            where: { slug: prob.slug },
            update: {
                ...probData,
                tags: {
                    deleteMany: {},
                    create: (tags || []).map(tag => ({ name: tag })),
                },
                examples: {
                    deleteMany: {},
                    create: (examples || []),
                },
                hints: {
                    deleteMany: {},
                    create: (hints || []),
                },
                testCases: {
                    deleteMany: {},
                    create: (testCases || []),
                },
                starterCode: {
                    deleteMany: {},
                    create: (starterTemplates || []),
                },
            },
            create: {
                ...probData,
                tags: {
                    create: (tags || []).map(tag => ({ name: tag })),
                },
                examples: {
                    create: (examples || []),
                },
                hints: {
                    create: (hints || []),
                },
                testCases: {
                    create: (testCases || []),
                },
                starterCode: {
                    create: (starterTemplates || []),
                },
            },
        });

        console.log(`Upserted problem: ${createdProblem.title}`);
    }

    console.log('✅ Coding problems seeding finished.');
}

if (require.main === module) {
    const prisma = new PrismaClient();
    seedCoding(prisma)
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
