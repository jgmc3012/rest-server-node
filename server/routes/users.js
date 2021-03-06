const User = require('../models/users')
const express = require('express')
const bcrypt = require('bcrypt')
const _ = require('underscore')
const { raise_err } = require('../utils/errors')
const { verifyToken } = require('../middlewares/authentication')
const { isAdmin } = require('../middlewares/permissions')

const app = express()

app.get('/users/', verifyToken, (req, res) => {
    const offset = Number(req.query.offset) || 0
    const limit = Number(req.query.limit) || 5
    const condition = { state: true }
    const fields = 'name email img'

    User.find(condition, fields)
        .skip(offset)
        .limit(limit)
        .exec((err, users) => {
            if (err) return raise_err(res, err)
            User.countDocuments(condition, (err, total) => {
                if (err) return raise_err(res ,err)
                res.json({
                    success: true,
                    info: { users, offset, limit, total }
                })
            })
        })
})


app.post('/users/', [verifyToken, isAdmin], (req, res) => {
    let body = req.body
    let user = new User({
        ...body,
        password: bcrypt.hashSync(body.password, 10)
    })
    user.save()
        .then(data => res.json({
            success: true,
            info: { user },
            message: "Usuario creado exitosamente!"
        }))
        .catch(err => res.status(400).json({
            success: false,
            detail: err
        }))
})

app.patch('/users/:user_id', [verifyToken, isAdmin], (req, res) => {
    const id = req.params.user_id
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'state'])

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
        if (err) return raise_err(res, err)
        res.json({
            'success': true,
            'message': "User Updated",
            'info': { user: userDB }
        })
    })

})

app.delete('/users/:user_id', [verifyToken, isAdmin], (req, res) => {
    const id = req.params.user_id

    // Remove hard
    // User.findByIdAndDelete(id, (err, userDeteled) => {
    //     if (err) return raise_err(res, err)
    //     res.json({
    //         'success': true,
    //         'message': "User Deleted",
    //         'info': { userDeteled }
    //     })
    // })

    const body = { state: false }
    const opts = { new: true }

    User.findByIdAndUpdate(id, body, opts, (err, user) => {
        if (err) return raise_err(res, err)
        res.json({
            'success': true,
            'message': "User Deleted",
            'info': { user }
        })
    })



})

module.exports = app;