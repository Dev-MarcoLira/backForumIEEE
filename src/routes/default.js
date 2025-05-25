import express from 'express';

const router = express.Router();

/* 
hello world route
This route is used to check if the API is working 
*/
router.get('/', (req, res) => {
    res.json({ message: 'API is working' });
});


export default router;