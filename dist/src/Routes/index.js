'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const express_1 = require('express')
// import userRouter from "./userRoute";
const router = (0, express_1.Router)()
// router.use("/api/v1/user/", userRouter);
router.get('/test', (req, res) => {
  res.send('Hello World')
})
exports.default = router
