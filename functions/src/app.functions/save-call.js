const util = require("util");
const request = util.promisify(require("request"));
const { Retell } = require("retell-sdk/index.mjs");

// These are defined by `hs secrets add` command
const { HUB_API_KEY, RETELL_API_KEY } = process.env;

// Helper function to convert an object to a nice formatted text
const objToText = obj => {
  return Object.entries(obj)
    .map(([label, value]) => {
      return `${label}: ${value}`;
    })
    .join("\n\n");
};

const searchTicket = async call_id => {
  const { statusCode, body } = await request({
    baseUrl: "https://api.hubspot.com",
    uri: "/crm/v3/objects/tickets/search",
    json: true,
    headers: {
      authorization: `Bearer ${HUB_API_KEY}`,
      "content-type": "application/json"
    },
    method: "POST",
    body: {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "retell_call_id",
              operator: "EQ",
              value: call_id
            }
          ]
        }
      ]
    }
  });
  if (statusCode != 200) {
    console.error("Error searching tickets:", body);
    throw new Error(body.message);
  }
  return body;
};

const saveTicket = async call_id => {
  const callResponse = await retellClient.call.retrieve(call_id);

  const { recording_url, transcript, call_analysis, metadata } = callResponse;

  // if (metadata) {
  // const { accountId, contact, email, last_name, first_name, utk } = metadata;
  // Here you can update contact in HubSpot
  // accountId is the HubSpot portal ID
  // contact is the HubSpot contact retrieved by the utk
  // email, last_name, first_name are the widget form data
  // }

  const { statusCode, body } = await request({
    baseUrl: "https://api.hubspot.com",
    uri: "/crm/v3/objects/tickets",
    json: true,
    headers: {
      authorization: `Bearer ${HUB_API_KEY}`,
      "content-type": "application/json"
    },
    method: "POST",
    body: {
      properties: {
        hs_pipeline: "0",
        hs_pipeline_stage: "1",
        subject: `Call #${call_id}`,
        content: `Transcript: ${transcript}`,
        retell_call_id: call_id,
        retell_record_file: recording_url,
        retell_call_analysys: `${
          call_analysis ? objToText(call_analysis) : "No analysis available"
        }`
      }
    }
  });

  if (statusCode > 299) {
    console.error("Error saving ticket:", body);
    throw new Error(body.message);
  }

  return body;
};

const retellClient = new Retell({
  apiKey: RETELL_API_KEY
});

// WARNING: Rewrite this function to use the Retell webhook to receive recorded data. Don't use it in production.
exports.main = (context, sendResponse) => {
  const { accountId, body = {}, contact } = context;
  const { agent_id, call_id } = body;

  if (!call_id) {
    sendResponse({
      statusCode: 400,
      body: {
        call_id,
        message: "Missing call_id"
      }
    });
    return;
  }

  (async () => {
    try {
      const tickets = await searchTicket(call_id);

      if (tickets.total > 0) {
        sendResponse({
          statusCode: 200,
          body: {
            tickets,
            message: "Call already saved in HubSpot"
          }
        });
        return;
      }

      await saveTicket(call_id, agent_id);

      sendResponse({
        body: {
          status: "success"
        },
        statusCode: 200
      });
    } catch (e) {
      sendResponse({
        statusCode: 500,
        body: {
          message: "There was a problem saving the call data.",
          error: e.message
        }
      });
    }
  })();
};
