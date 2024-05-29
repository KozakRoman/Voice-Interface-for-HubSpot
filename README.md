# Voice customer feedback – AI extension for HubSpot

Before installation you would need [Retell API key](https://www.retellai.com/) and [HubSpot private App](https://developers.hubspot.com/docs/api/private-apps) Access token with ticket scopes. Also, you need to [add custom properties](https://knowledge.hubspot.com/properties/create-and-edit-properties) to Tickets HubSpot CRM object. Here is the list of custom properties and corresponding data type:

- retell_call_id – single-line text
- retell_record_file – file
- retell_call_analysys – multi-line text


For installation you can choose **Express install** or **Granular install** instruction set.

## Express Installation

Perform all 6 steps to install widget and serverless functions to you HubSpot portal.

1. ```npm install -g @hubspot/cli```

2. ```hs init```
3. ```hs secrets add RETELL_API_KEY```
4. ```hs secrets add HUB_API_KEY```

5. ```npm i```
6. ```npm run deploy```

## Granular installation

If express installation produced error try install it step by step.

### Install HubSpot cli

1. ```npm install -g @hubspot/cli```
2. ```hs init```
3. ```hs secrets add RETELL_API_KEY```
4. ```hs secrets add HUB_API_KEY```

### Install HubSpot serverless

1. ```cd functions```
2. ```npm install```
3. ```npm run build && npm run deploy```
4. ```cd ..```

### Install Widget to HubSpot

1. ```cd widget```
2. ```npm install```
3. ```npm run build && npm run deploy```


## Development Environment Setup

If you want to modify widget or functions follow this instructions.

### Functions Development

1. ```cd functions```
2. ```npm start```
3. Open second terminal tab
4. ```hs logs register-call --follow``` or  ```hs logs save-call --follow```

### Widget Development

1. ```cd widget```
2. ```npm start```


## Author

Yo can contact me on my LinkedIn - [Roman Kozak](https://www.linkedin.com/in/romangruit/)