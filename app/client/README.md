# 🚀 Deploying Etendo ChatBot UI

This is a tutorial on how to deploy the Etendo ChatBot UI application using Docker.

## 🛠️ Installation

To run the program locally, execute the following commands:

`yarn install`

`yarn dev`

To connect to the backend locally, you can use the following commands:

`kubectl port-forward -n chat-etendo svc/mlv-server-milvus 19530:19530`

`MILVUS_HOST=localhost MILVUS_PORT=19530 python3 server.py`

This will forward the port of the Milvus server running in the `chat-etendo` namespace to your local machine, and then start the server.py script with the Milvus host and port set to `localhost:19530`.

Once you have completed these steps, you should be able to access the Etendo ChatBot UI application and connect to the backend server locally.

Likewise, you can test the program in your browser by navigating to https://chat.etendo.cloud.

## 🐳 Step 1: Build the Docker image

First of all, execute the following command:

`yarn build`

Then, to build the Docker image of the application using the following command:

`docker build -t etendo/chatbot_ui .`

## 🚢 Step 2: Push the Docker image

Push the Docker image to your chosen container registry using the following command:

`docker push etendo/chatbot_ui`
