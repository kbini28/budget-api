// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const BudgetItem = require('../models/budgetItem')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /items
router.get('/items', requireToken, (req, res, next) => {
  BudgetItem.find({ owner: req.user.id })
    .then(items => {
      // `items` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
      return items.map(item => item.toObject())
    })
    // respond with status 200 and JSON of the examples
    .then(items => res.status(200).json({ items: items }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /items/**itemId**
router.get('/items/:id', requireToken, (req, res, next) => {
  BudgetItem.findById(req.params.id)
    .then(handle404)
    .then(item => res.status(200).json({ item: item.toObject() }))
    .catch(next)
})

// CREATE
// POST /items
router.post('/items', requireToken, (req, res, next) => {
  // set owner of new budgetItem to be current user
  req.body.item.owner = req.user.id

  BudgetItem.create(req.body.item)
    .then(item => res.status(201).json({ item: item.toObject() }))
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /items/**itemId**
router.patch('/items/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.item.owner

  BudgetItem.findById(req.params.id)
    .then(handle404)
    .then(item => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, item)
      // passes the result to the next .then
      return item.updateOne(req.body.item)
    })
    .then(() => res.sendStatus(204)) // no json, just an affirmative status
    .catch(next) // or an error if no owner, bad update, etc.
})

// DESTROY
// DELETE /items/**itemId**
router.delete('/items/:id', requireToken, (req, res, next) => {
  BudgetItem.findById(req.params.id)
    .then(handle404)
    .then(item => {
      requireOwnership(req, item)
      item.deleteOne()
    })
    .then(() => res.sendStatus(204)) // no response, just status update
    .catch(next)
})

module.exports = router
