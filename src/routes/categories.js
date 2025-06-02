const { authenticate } = require('../middleware/auth.js');
const router = require('express').Router();
const categoryController = require('../controller/categoryController.js');

router.get('/', categoryController.handleReadAllCategories)

router.get('/:id', categoryController.handleReadCategoryById)

router.post('/', authenticate, categoryController.handleCreateCategory)

router.delete('/:id', authenticate, categoryController.handleDeleteCategory)

router.put('/:id', authenticate, categoryController.handleUpdateCategory)

module.exports = router