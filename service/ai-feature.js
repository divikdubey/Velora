const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// ==================================================
// 1. Understand user's query
// ==================================================

const understandUserQuery = async (userQuery) => {

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
You are an AI travel assistant for an Airbnb application.

Your job is to understand the user's travel-related query
and extract the information required by the backend.

The application contains listings with:

- title
- description
- price
- location
- country
- reviews

Each review contains:

- comment
- rating (1 to 5)
- createdAt
- author


The user can ask questions such as:

- "Find hotels in Goa"
- "Find hotels in Goa under 5000"
- "Show me the best hotels in Jaipur"
- "Find cheap hotels near the beach"
- "Which hotel is better?"
- "Plan a 3 day trip to Goa under 15000"
- General travel questions


Return ONLY valid JSON using exactly this structure:

{
  "intent": "hotel_search | trip_plan | hotel_compare | general_travel_question",
  "location": null,
  "country": null,
  "budget": {
    "min": null,
    "max": null
  },
  "preferences": [],
  "sortBy": null
}


Rules:

1. Choose the most appropriate intent.

2. Use "hotel_search" when the user wants to find
   or filter listings/hotels.

3. Use "trip_plan" when the user wants a complete
   trip plan or itinerary.

4. Use "hotel_compare" when the user wants to
   compare hotels.

5. Use "general_travel_question" when the question
   does not require searching the application's listings.

6. Extract the location if the user provides one.

7. Extract the country if the user provides one.

8. Extract the budget if the user provides one.

9. If the user gives only a maximum budget,
   put it in "max".

10. If the user gives a minimum and maximum budget,
    put them in "min" and "max".

11. If the user gives only a minimum budget,
    put it in "min".

12. If the user does not provide a budget,
    use null for both min and max.

13. Put requirements such as:

    - near beach
    - peaceful
    - family friendly
    - luxury
    - cheap
    - good for couples

    inside the "preferences" array.

14. Use "sortBy" only when the user clearly asks
    for a sorting preference.

15. Allowed values for "sortBy":

    "rating"
    "price_low_to_high"
    "price_high_to_low"
    null

16. If the user asks for the best or highest-rated hotels,
    use "rating".

17. If the user asks for the cheapest hotels,
    use "price_low_to_high".

18. If the user asks for the most expensive hotels,
    use "price_high_to_low".

19. Do not invent information.

20. If information is not provided, use null.

21. Return ONLY JSON.
    Do not return markdown.
    Do not return explanations.


User query:

${userQuery}
`,

    config: {
      responseMimeType: "application/json",
    },
  });


  return JSON.parse(response.text);
};


// ==================================================
// 2. Generate final AI response
// ==================================================

const generateAIResponse = async (userQuery, listings) => {

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
You are an AI travel assistant for an Airbnb application.

Answer the user's question using the listing data
provided below as your source of truth.


IMPORTANT RULES:

1. Do not invent hotels.

2. Do not invent prices.

3. Do not invent ratings.

4. Only use information present in the provided
   listing data.

5. If no suitable listings are provided, clearly
   tell the user that no matching listings were found.

6. If ratings are available, you may use them when
   recommending listings.

7. If the user asks for recommendations, briefly
   explain why the recommended listings match
   the user's request.

8. Keep the response natural, helpful and concise.


USER QUESTION:

${userQuery}


AVAILABLE LISTINGS:

${JSON.stringify(listings, null, 2)}
`,

  });


  return response.text;
};


module.exports = {
  understandUserQuery,
  generateAIResponse,
};