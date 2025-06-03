const { authenticate } = require('../middleware/auth.js')
const questionController = require('../controller/questionController.js')

const router = require('express').Router();

router.get('/', questionController.handleReadAllQuestions)

router.get('/:id', questionController.handleReadQuestionById)

router.post('/', authenticate, questionController.handleCreateQuestion)

router.delete('/:id', authenticate, questionController.handleDeleteQuestion)

router.put('/:id', authenticate, questionController.handleUpdateQuestion)

module.exports = router