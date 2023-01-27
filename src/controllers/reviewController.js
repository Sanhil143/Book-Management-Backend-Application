const reviewModel = require("../models/reviewModel")
const BookModel = require("../models/bookModel")
const { isValidObjectId, isValidName } = require("../Validations/Validator")

const createReview = async function (req, res) {
      try {
            let reviewData = req.body
            let bookId = req.params.bookId
            if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "BookId is not valid" })

            let checkBookId = await BookModel.findById({ _id: bookId, isDeleted: false })

            if (!checkBookId) {
                  return res.status(404).send({ status: false, message: "Book Not Found" });
            }
            reviewData.bookId = checkBookId._id
            let savedData = await reviewModel.create(reviewData)

           
            let updatedBooks = await BookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: +1 } }, { new: true }).select({ __v: 0 })
            if (!updatedBooks) return res.status(400).send({ status: false, message: "Book Not Found" })

            let temp = updatedBooks._doc
            temp.reviewData = savedData

            return res.status(201).send({ status: true, data: temp })
      }
      catch(error){
            return res.status(500).send({status:false, message:error.message})
      }
}

const reviewUpdate = async function (req, res) {
      try {
          let data = req.body;
          const  { rating } = data
          if (Object.entries(data).length == 0) {
              return res.status(400).send({ status: false, message: "please provide some data" })
          }
  
  
          let bookId = req.params.bookId;
  
          if (!bookId)
          return res.status(400).send({ status: false, message: " please enter bookId" })
  
          if (!isValidObjectId(bookId)) {
              return res.status(400).send({ status: false, message:  "enter valid book id"})
          }
  
          let book = await BookModel.findOne({ _id: bookId, isDeleted: false })
          if (!book) {
              return res.status(404).send({ status: false, message: "Book  not found" })
          }
  
          let reviewId = req.params.reviewId;

      
  
          if (!reviewId)
          return res.status(400).send({ status: false, message: " please enter rewiewId" })
  
          if (!isValidObjectId(reviewId)) {
              return res.status(400).send({ status: false, message: "enter valid review id" })
          }
  
          let reviewExit = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
          if (!reviewExit) {
              return res.status(404).send({ status: false, message: "review  not exists" })
          }
         
         if (rating < 1 || rating > 5) return res.status(400).send({ status: false, message: "rating should be inbetween 1 and 5" })
        
  
          let savedData = await reviewModel.findOneAndUpdate({ _id: reviewId },
              data, { updatedAt: new Date(), new: true })
          return res.status(200).send({ status: true, message: savedData });
      }
      catch (error) {
          console.log(error)
          return res.status(500).send({ status: false, message: error.message })
      }
  }


const deleteReview = async function (req, res) {
      try {
            let bookId = req.params.bookId;
            let reviewId = req.params.reviewId;

            if (!bookId) {
                  return res
                        .status(400)
                        .send({ status: false, message: "bookId is not present" });
            }

            if (!isValidObjectId(bookId)) {
                  return res
                        .status(400)
                        .send({ status: false, message: "this is not a valid book Id" });
            }

            if (!reviewId) {
                  return res
                        .status(400)
                        .send({ status: false, message: "reviewId is not present" });
            }

            if (!isValidObjectId(reviewId)) {
                  return res
                        .status(400)
                        .send({ status: false, message: "this is not a valid review Id" });
            }

            let findBook = await BookModel.findOne({ _id: bookId });
            if (!findBook) {
                  return res.status(404).send({ status: false, message: "A book with this id does not exists", });
            }

            if (findBook.isDeleted == true) {
                  return res.status(404).send({ status: false, message: "This book has been deleted" });
            }

            let findReview = await reviewModel.findOne({ _id: reviewId });

            if (!findReview) {
                  return res.status(404).send({ status: false, message: "A review with this id does not exists" });
            }

            if (findReview.isDeleted == true) {
                  return res.status(404).send({ status: false, message: "This review is already deleted" });
            }

            if (findReview.bookId != bookId) {
                  return res.status(403).send({ status: false, message: "This review is not of this book" });
            }

            let deletedReview = await reviewModel.findOneAndUpdate({ _id: reviewId },
                  { $set: { isDeleted: true }, deletedAt: Date.now() },
                  { new: true, upsert: true });

            await BookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true });
            return res.status(200).send({ status: true, message: "review has been deleted", data: deletedReview });
      } catch (err) {
            return res.status(500).send({ status: false, message: err.message });
      }
};

module.exports = { createReview, deleteReview, reviewUpdate }