---  
published: true  
layout: post  
title: 重建二叉树
date: 2017-08-10  
category: work  
---  


```
/**
 * Definition for binary tree
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    TreeNode* reConstructBinaryTree(vector<int> pre,vector<int> vin) {
		return processConstructBinaryTree(pre, 0, pre.size() - 1, vin, 0, vin.size() - 1);
    }

   // 前序遍历{1,2,4,7,3,5,6,8}和中序遍历序列{4,7,2,1,5,3,8,6}
   TreeNode* processConstructBinaryTree(vector<int> pre, int startPre, int endPre, vector<int> in, int startIn, int endIn) {
        if (startPre > endPre || startIn > endIn) return NULL;
        TreeNode* root = new TreeNode(pre[startPre]);
        for (int i = startIn;i <= endIn; i++) {
            if (in[i] == pre[startPre]) {
                root->left = processConstructBinaryTree(pre, startPre + 1, startPre + i - startIn, in, startIn, i - 1);
                root->right = processConstructBinaryTree(pre, i - startIn + startPre + 1, endPre, in, i + 1, endIn);
            }
        }
        return root;
    }
};
```
