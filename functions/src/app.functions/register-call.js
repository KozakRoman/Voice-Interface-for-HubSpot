const { Retell } = require("retell-sdk/index.mjs");

const { RETELL_API_KEY } = process.env;

exports.main = (context, sendResponse) => {
  const { accountId, body = {}, params, contact, method, secrets } = context;

  if (method == "GET") {
    sendResponse({
      statusCode: 200,
      body: "I'm awake"
    });
    return;
  }

  const retellClient = new Retell({
    apiKey: RETELL_API_KEY
  });
  const { agent_id, retell_llm_dynamic_variables = {}, metadata = {} } = body;

  if (!agent_id) {
    sendResponse({
      statusCode: 400,
      body: {
        error: "agent_id is required"
      }
    });
    return;
  }

  (async () => {
    try {
      const callResponse = await retellClient.call.register({
        agent_id: agent_id,
        audio_websocket_protocol: "web",
        audio_encoding: "s16le",
        sample_rate: 24000,
        end_call_after_silence_ms: 15000,
        retell_llm_dynamic_variables: retell_llm_dynamic_variables,
        metadata: {
          accountId: accountId,
          contact: contact,
          ...metadata
        }
      });
      //   // Send back the successful response to the client
      console.log("Call registered:", callResponse);

      sendResponse({
        statusCode: 200,
        body: {
          ...callResponse
        }
      });
    } catch (error) {
      console.error("Error registering call:", error);
      // Send an error response back to the client
      sendResponse({
        statusCode: 500,
        body: {
          error: "Failed to register call"
        }
      });
    }

    // sendResponse({
    //   body: {
    //     accountId,
    //     body,
    //     params,
    //     contact,
    //     method
    //   }
    // });
  })();
};
