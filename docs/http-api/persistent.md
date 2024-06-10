---
id: http-persistent
title: Persistent subscriptions | HTTP API
sidebar_label: Persistent subscriptions
sidebar_position: 2
---

# Persistent subscriptions with HTTP API

This document explains how to use the HTTP API for setting up and consuming persistent subscriptions and competing consumer subscription groups. For an overview on competing consumers and how they relate to other subscription types, please see our [introduction to persistent subscriptions](/persistent-subscriptions).

:::tip
The Administration UI includes a _Competing Consumers_ section where you are able to create, update, delete and view subscriptions and their statuses.
:::

## Creating a persistent subscription

Before interacting with a subscription group, you need to create one. Do this by making a PUT request to the subscriptions resource, specifying the stream you would like to subscribe to and a name for the subscription in the request path.

```bash
curl -X PUT 'http://127.0.0.1:2113/subscriptions/newstream/newsub' -u admin:changeit -H "Content-Type:application/json"
```

You will get a 201 response when the subscription is successfully created.

```http
Content-Length: 162
Content-Type: application/json; charset=utf-8
Date: Thu, 25 Apr 2024 00:18:22 GMT
Server: Kestrel
Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-Forwarded-Host, X-Forwarded-Prefix, X-PINGOTHER, Authorization, ES-LongPoll, ES-ExpectedVersion, ES-EventId, ES-EventType, ES-RequireMaster, ES-RequireLeader, ES-HardDelete, ES-ResolveLinkTos
Access-Control-Allow-Methods: PUT, POST, DELETE, GET, GET, OPTIONS
Access-Control-Allow-Origin: *
Access-Control-Expose-Headers: Location, ES-Position, ES-CurrentVersion
Location: http://localhost:2113/subscriptions/newstream/newsub

{
	"correlationId": "adbc8021-3857-47cd-b6cf-27bae2064f09",
	"reason": "",
	"result": "Success",
	"msgTypeId": 43,
	"label": "ClientMessageCompleted"
}
```

This call requires [admin permissions](./security.mdx). You will get an error if you try to create a subscription group more than once.

See the [technical reference](./api.md#create-subscription) for details on the available optional parameters that you can pass as a JSON data object when creating a subscription.

:::warning
Persistent subscriptions to `$all` are not supported over the HTTP API. If you want to create persistent subscriptions to `$all`, use the appropriate [client method](/clients).
:::

## Updating a persistent subscription

You can edit the settings of an existing subscription while it is running by making a POST request to the subscription you created above. This drops the current subscribers and resets the subscription internally.

```bash
curl -X POST 'http://127.0.0.1:2113/subscriptions/{stream}/{subscription_name}' -u admin:changeit -H "Content-Type:application/json"
```

`{stream}` is the name of the stream the persistent subscription is on, while `{subscription_name}` is the name of the existing subscription group. This call requires [admin permissions](./security.mdx). The optional settings parameters are the same as the request to create a subscription. See the [technical reference](./api.md#schemasubscriptionitem) for full details.

## Deleting a persistent subscription

If needed, you can delete the subscription group with a DELETE request to the same resource. Once again, `{stream}` is the name of the stream the persistent subscription and `{subscription_name}` is the name of the subscription group you want to delete.

```bash
curl -X DELETE 'http://127.0.0.1:2113/subscriptions/{stream}/{subscription_name}' -u admin:changeit
```

:::warning
Deleting persistent subscriptions to `$all` is not supported over the HTTP API. If you want to delete persistent subscriptions to `$all`, use the appropriate [client method](/clients).
:::

## Getting information for all subscriptions

Get information on all subscriptions on all streams with a GET request to the subscriptions endpoint.

`http://127.0.0.1:2113/subscriptions`

The JSON response is a list of all subscriptions and their attributes.

```json
[
  {
    "links": [
      {
        "href": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/info",
        "rel": "detail"
      }
    ],
    "eventStreamId": "newstream",
    "groupName": "competing_consumers_group1",
    "parkedMessageUri": "http://localhost:2113/streams/$persistentsubscription-newstream::competing_consumers_group1-parked",
    "getMessagesUri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/1",
    "status": "Live",
    "averageItemsPerSecond": 0.0,
    "totalItemsProcessed": 0,
    "lastProcessedEventNumber": -1,
    "lastKnownEventNumber": 5,
    "connectionCount": 0,
    "totalInFlightMessages": 0
  },
  {
    "links": [
      {
        "href": "http://localhost:2113/subscriptions/another_newstream/competing_consumers_group1/info",
        "rel": "detail"
      }
    ],
    "eventStreamId": "another_newstream",
    "groupName": "competing_consumers_group1",
    "parkedMessageUri": "http://localhost:2113/streams/$persistentsubscription-another_newstream::competing_consumers_group1-parked",
    "getMessagesUri": "http://localhost:2113/subscriptions/another_newstream/competing_consumers_group1/1",
    "status": "Live",
    "averageItemsPerSecond": 0.0,
    "totalItemsProcessed": 0,
    "lastProcessedEventNumber": -1,
    "lastKnownEventNumber": -1,
    "connectionCount": 0,
    "totalInFlightMessages": 0
  }
]
```

## Get subscriptions for a stream

To see all subscriptions on a single stream, add the stream name to the path in your GET request.

`http://127.0.0.1:2113/subscriptions/{stream}`

The JSON response is a list of the stream's subscriptions and their attributes.

```json
[
  {
    "links": [
      {
        "href": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/info",
        "rel": "detail"
      }
    ],
    "eventStreamId": "newstream",
    "groupName": "competing_consumers_group1",
    "parkedMessageUri": "http://localhost:2113/streams/$persistentsubscription-newstream::competing_consumers_group1-parked",
    "getMessagesUri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/1",
    "status": "Live",
    "averageItemsPerSecond": 0.0,
    "totalItemsProcessed": 0,
    "lastProcessedEventNumber": -1,
    "lastKnownEventNumber": 5,
    "connectionCount": 0,
    "totalInFlightMessages": 0
  }
]
```

## Getting a specific subscription

To get information about a single subscription, use a GET request to the info resource on the subscription URI.

`http://127.0.0.1:2113/subscriptions/{stream}/{subscription_name}/info`

The JSON response includes resource URIs for the subscription, the subscription configuration, and the subscription attributes.

```json
{
  "links": [
    {
      "href": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/info",
      "rel": "detail"
    },
    {
      "href": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/replayParked",
      "rel": "replayParked"
    }
  ],
  "config": {
    "resolveLinktos": false,
    "startFrom": 0,
    "messageTimeoutMilliseconds": 10000,
    "extraStatistics": false,
    "maxRetryCount": 10,
    "liveBufferSize": 500,
    "bufferSize": 500,
    "readBatchSize": 20,
    "preferRoundRobin": true,
    "checkPointAfterMilliseconds": 1000,
    "minCheckPointCount": 10,
    "maxCheckPointCount": 500,
    "maxSubscriberCount": 10,
    "namedConsumerStrategy": "RoundRobin"
  },
  "eventStreamId": "newstream",
  "groupName": "competing_consumers_group1",
  "status": "Live",
  "averageItemsPerSecond": 0.0,
  "parkedMessageUri": "http://localhost:2113/streams/$persistentsubscription-newstream::competing_consumers_group1-parked",
  "getMessagesUri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/1",
  "totalItemsProcessed": 0,
  "countSinceLastMeasurement": 0,
  "lastProcessedEventNumber": -1,
  "lastKnownEventNumber": 5,
  "readBufferCount": 6,
  "liveBufferCount": 5,
  "retryBufferCount": 0,
  "totalInFlightMessages": 0,
  "connections": []
}
```

## Reading a stream via a persistent subscription

By default, a GET request to read a stream via a persistent subscription returns a single event per request and does not embed the event properties as part of the response.

The stream reading resource URI is generally structured like this:

`http://127.0.0.1:2113/subscriptions/{stream}/{subscription_name}`

To embed event properties in the response, include the `embed` query.

`http://127.0.0.1:2113/subscriptions/{stream}/{subscription_name}?embed={embed}`

Allowed values are `none` (the default), `rich`, and `body`. `Rich` embed mode returns additional properties about the event. `Body` returns the JSON/XML body of the events into the feed as well.

You can also specify the event count to return in the request by adding the count in the URI string.

`http://127.0.0.1:2113/subscriptions/{stream}/{subscription}/{count}?embed={embed}`

See [Reading Streams](README.mdx#reading-streams-and-events) for details on the different embed levels.

<details>
<summary>Sample response</summary>

```json
{
  "title": "All Events Persistent Subscription",
  "id": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1",
  "updated": "2015-12-02T09:17:48.556545Z",
  "author": {
    "name": "EventStore"
  },
  "headOfStream": false,
  "links": [
    {
      "uri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/ack%3Fids=c322e299-cb73-4b47-97c5-5054f920746f",
      "relation": "ackAll"
    },
    {
      "uri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/nack%3Fids=c322e299-cb73-4b47-97c5-5054f920746f",
      "relation": "nackAll"
    },
    {
      "uri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/1%3Fembed=None",
      "relation": "previous"
    },
    {
      "uri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1",
      "relation": "self"
    }
  ],
  "entries": [
    {
      "title": "1@newstream",
      "id": "http://localhost:2113/streams/newstream/1",
      "updated": "2015-12-02T09:17:48.556545Z",
      "author": {
        "name": "EventStore"
      },
      "summary": "SomeEvent",
      "links": [
        {
          "uri": "http://localhost:2113/streams/newstream/1",
          "relation": "edit"
        },
        {
          "uri": "http://localhost:2113/streams/newstream/1",
          "relation": "alternate"
        },
        {
          "uri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/ack/c322e299-cb73-4b47-97c5-5054f920746f",
          "relation": "ack"
        },
        {
          "uri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/nack/c322e299-cb73-4b47-97c5-5054f920746f",
          "relation": "nack"
        }
      ]
    }
  ]
}
```

</details>

## Acknowledgements

Clients must acknowledge (or not acknowledge) messages in the competing consumer model. If processing is successful, send an **ack** (acknowledge) to the server to let it know that the message has been handled. If processing fails, then you can **nack** (not acknowledge) the message and tell the server how to handle the failure. If the client fails to respond in the given timeout period, the message is retried.

Prefer using the `ack` relative links in the subscription stream response [discussed above](#reading-a-stream-via-a-persistent-subscription) for acknowledgements rather than bookmark URIs, as they are subject to change in future versions. The link will look like this:

```json
{
  "uri": "http://localhost:2113/subscriptions/newstream/competing_consumers_group1/ack/c322e299-cb73-4b47-97c5-5054f920746f",
  "relation": "ack"
}
```

### Ack multiple messages

To acknowledge multiple messages by ID, use a POST request to the `ack` resource on the subscription URI. You can specify multiple message IDs with the `ids` query on the resource.

`http://localhost:2113/subscriptions/{stream}/{subscription_name}/ack?ids={messageids}`

See the [technical reference](./api.md#acknowledge-multiple-messages) for full string parameter details.

### Ack a single message

To acknowledge a single message by ID, use a POST request to the `ack` resource on the subscription URI. Here you will specify a single message ID endpoint.

`http://localhost:2113/subscriptions/{stream}/{subscription_name}/ack/{messageid}`

See the [technical reference](./api.md#acknowledge-a-single-message) for full string parameter details.

### Nack multiple messages

To not acknowledge multiple messages by ID, use a POST request to the `nack` resource on the subscription URI. You can specify multiple message IDs with the `ids` query on the resource.

You can also define an action to take when the messages are nacked with the `action` query. This is optional. Possible values are:

- **Park**: Don't retry the message; park it until a request is sent to [replay](#replaying-parked-messages) the parked messages.
- **Retry**: Retry the message.
- **Skip**: Discard the message.
- **Stop**: Stop the subscription.

`http://localhost:2113/subscriptions/{stream}/{subscription_name}/nack?ids={messageids}?action={action}`

See the [technical reference](./api.md#dont-acknowledge-multiple-messages) for full string parameter details.

### Nack a single message

To not acknowledge a single message by ID, send a POST request to the `nack` resource on the subscription URI. Here you will specify a single message ID endpoint. You can optionally define an action to take when the message is nacked with the `action` query. Possible values are:

- **Park**: Don't retry the message; park it until a request is sent to [replay](#replaying-parked-messages) the parked messages.
- **Retry**: Retry the message.
- **Skip**: Discard the message.
- **Stop**: Stop the subscription.

`http://localhost:2113/subscriptions/{stream}/{subscription_name}/nack/{messageid}?action={action}`

See the [technical reference](./api.md#dont-acknowledge-a-single-message) for full string parameter details.

## Replaying parked messages

If you have parked messages, you can replay them with a POST request to the `replayParked` resource on the subscription URI.

`http://localhost:2113/subscriptions/{stream}/{subscription_name}/replayParked`

This will attempt to replay all parked messages. See the [technical reference](./api.md#replay-previously-parked-messages) for full parameter details.
