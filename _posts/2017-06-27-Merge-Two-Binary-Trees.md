---  
published: true  
layout: post  
title: Merge Two Binary Trees
date: 2017-06-27  
category: work  
---  
*LeetCode*: Merge Two Binary Trees

今天刷LeetCode时看到了一道挺有意思的题，如果用递归的思路则很快地解出！

以下是题目描述

>Given two binary trees and imagine that when you put one of them to cover the other, some nodes of the two trees are overlapped while the others are not.
>
>You need to merge them into a new binary tree. The merge rule is that if two nodes overlap, then sum node values up as the new value of the merged node. Otherwise, the NOT null node will be used as the node of new tree.

## **Example 1:**

![image](/img/MergeTwoBinaryTrees.png)

**Note:** The merging process must start from the root nodes of both trees.

## 上代码，简介明了

```c
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     struct TreeNode *left;
 *     struct TreeNode *right;
 * };
 */
struct TreeNode* mergeTrees(struct TreeNode* t1, struct TreeNode* t2) {
  if (t1 == NULL) return t2;
  if (t2 == NULL) return t1;
  struct TreeNode *node = (struct TreeNode *)malloc(sizeof(struct TreeNode));
  node->val = (t1 ? t1->val : 0) + (t2 ? t2->val : 0);
  node->left = mergeTrees(t1->left, t2->left);
  node->right = mergeTrees(t1->right, t2->right);
  return node;
}
```

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */
/**
 * @param {number[]} preorder
 * @param {number[]} inorder
 * @return {TreeNode}
 */
var buildTree = function(, inorder) {
  if (preorder.length === 0) return null;

  var rootValue = preorder[0];
  var rootIndex = inorder.indexOf(rootValue);

  var root = new TreeNode(rootValue);
  root.left = buildTree(preorder.slice(1, rootIndex + 1), inorder.slice(0, rootIndex));
  root.right = buildTree(preorder.slice(rootIndex + 1), inorder.slice(rootIndex + 1));

  return root
};
```
