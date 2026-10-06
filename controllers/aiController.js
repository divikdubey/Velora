const {
    understandUserQuery,
    generateAIResponse,
  } = require("../service/ai-feature");
  
  const {
    findListings,
    createListingContext,
  } = require("../service/listingService");
  
  
  // ==================================================
  // POST /api/ai/chat
  // ==================================================
  
  const chatWithAI = async (req, res) => {
  
    try {
  
      // ----------------------------------------------
      // 1. Get user message
      // ----------------------------------------------
  
      const { message } = req.body;
  
  
      if (!message || !message.trim()) {
  
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }
  
  
      // ----------------------------------------------
      // 2. Understand user query
      // ----------------------------------------------
  
      const queryData =
        await understandUserQuery(
          message.trim()
        );
  
  
      console.log(
        "AI Query Data:",
        queryData
      );
  
  
      // ----------------------------------------------
      // 3. General travel question
      // ----------------------------------------------
  
      if (
        queryData.intent ===
        "general_travel_question"
      ) {
  
        const answer =
          await generateAIResponse(
            message.trim(),
            []
          );
  
  
        return res.status(200).json({
          success: true,
          answer,
        });
      }
  
  
      // ----------------------------------------------
      // 4. Find listings
      // ----------------------------------------------
  
      const listings =
        await findListings(queryData);
  
  
      console.log(
        "Listings Found:",
        listings.length
      );
  
  
      // ----------------------------------------------
      // 5. Create AI context
      // ----------------------------------------------
  
      const context =
        createListingContext(listings);
  
  
      // ----------------------------------------------
      // 6. Generate final response
      // ----------------------------------------------
  
      const answer =
        await generateAIResponse(
          message.trim(),
          context
        );
  
  
      // ----------------------------------------------
      // 7. Send response
      // ----------------------------------------------
  
      return res.status(200).json({
        success: true,
        answer,
      });
  
    } catch (error) {
  
      console.error(
        "AI Controller Error:",
        error
      );
  
  
      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while processing your request",
      });
    }
  };
  
  const renderAIPage = (req, res) => {
    res.render("ai.ejs");
};
  
  module.exports = {
    chatWithAI,
    renderAIPage
  };