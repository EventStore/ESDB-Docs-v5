---
id: http-projections
title: Projections | HTTP API
sidebar_label: Projections
sidebar_position: 3
---

# Projections with HTTP API

In Event Sourcing, Projections (also known as View Models or Query Models) provide a view of the underlying event-based data model. Often they represent the logic of translating the source write model into the read model. They are used in both read models and write models.

You can create, manage, and query the state of all projections using the HTTP API. See the [HTTP API Reference](api.md) for all of the resources and details on parameters and responses.

In this guide, we will follow an example use case of an Xbox retailer's sales system.

## Data

First, we will need some sample data to work with. Download the following files that contain events from customer shopping carts.

- [shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1164.json](./data/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1164.json)
- [shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1165.json](./data/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1165.json)
- [shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1166.json](./data/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1166.json)
- [shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1167.json](./data/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1167.json)

Add the sample data to four different streams:

```bash
curl -i -d "@shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1164.json" -u "admin:changeit" "http://127.0.0.1:2113/streams/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1164" -H "Content-Type:application/vnd.eventstore.events+json"

curl -i -d "@shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1165.json" -u "admin:changeit" "http://127.0.0.1:2113/streams/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1165" -H "Content-Type:application/vnd.eventstore.events+json"

curl -i -d "@shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1166.json" -u "admin:changeit" "http://127.0.0.1:2113/streams/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1166" -H "Content-Type:application/vnd.eventstore.events+json"

curl -i -d "@shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1167.json" -u "admin:changeit" "http://127.0.0.1:2113/streams/shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1167" -H "Content-Type:application/vnd.eventstore.events+json"
```

## Creating your first projection

Let's create a projection that counts the number of 'XBox One S's that customers added to their shopping carts.

A projection starts with a selector, in this case `fromAll()`. Another possibility is `fromCategory({category})` which we discusses later, but for this projection we will use `fromAll`.

The second part of a projection is a set of filters. There is a special filter called `$init` that sets up an initial state. You want to start a counter from 0 and each time EventStoreDB observes an `ItemAdded` event for an 'Xbox One S,' increment the counter.

Here is the projection code:

```js
fromAll().when({
  $init: function () {
    return {
      count: 0,
    };
  },
  ItemAdded: function (s, e) {
    if (e.body.Description.indexOf("Xbox One S") >= 0) {
      s.count += 1;
    }
  },
});
```

You create a projection by calling the projection API and providing it with the definition of the projection. Here you decide how to run the projection, declaring that you want the projection to start from the beginning and keep running.

Make a `POST` request to the continuous projection resource, passing the projection JSON file as a parameter of your request, along with any other settings:

```bash
curl -i --data-binary "@xbox-one-s-counter.js" \
    http://localhost:2113/projections/continuous?name=xbox-one-s-counter%26type=js%26enabled=true%26emit=true%26trackemittedstreams=true \
    -u admin:changeit
```

:::tip Next steps
[See the API reference](api.md#create-a-continuous-projection) for more information on creating projections with the HTTP API and the parameters available.
:::

You can also create a projection using the Admin UI by opening the _Projections_ tab, clicking the _New Projection_ button and filling in the details of your projection.

![Creating a projection with the EventStoreDB Admin UI](./images/ui-create-projection.png)

## Querying for the state of the projection

Now that the projection is running, you can query the state of the projection. As this projection has a single state, query it with the following request:

```bash
curl -i http://localhost:2113/projection/xbox-one-s-counter/state -u "admin:changeit"
```

The server will send a response similar to this:

```json
{
  "count": 3
}
```

So, our projection shows that 3 customers have added the Xbox One S to their shopping cart.

## Appending to streams from projections

Querying the projection state gives you the correct result but requires you to poll for the state of a projection. What if you wanted EventStoreDB to notify you about state updates via subscriptions?

### Output state

Update the projection to output the state to a new stream by calling the `outputState()` method on the projection. This produces a `$projections-{projection-name}-result` stream by default.

Below is the updated projection definition:

```js
fromAll()
  .when({
    $init: function () {
      return {
        count: 0,
      };
    },
    ItemAdded: function (s, e) {
      if (e.body.Description.indexOf("Xbox One S") >= 0) {
        s.count += 1;
      }
    },
  })
  .outputState();
```

To update the projection, edit the projection definition in the Admin UI, or issue the following request:

```bash
curl -i -X PUT --data-binary @"xbox-one-s-counter-outputState.js" http://localhost:2113/projection/xbox-one-s-counter/query?emit=true -u admin:changeit
```

Then reset the projection you created above:

```bash
curl -i -X POST "http://localhost:2113/projection/xbox-one-s-counter/command/reset" -H "accept:application/json" -H "Content-Length:0" -u admin:changeit
```

You should get a response similar to the one below:

```json
{
  "msgTypeId": 293,
  "name": "xbox-one-s-counter"
}
```

You can now read the events in the resulting emitted stream by issuing a read request.

```bash
curl -i "http://localhost:2113/streams/\$projections-xbox-one-s-counter-result?embed=body" -H "accept:application/json" -u admin:changeit | grep data
```

And you'll get a response like this:

```json
{
  "data": "{\"count\":3}",
  "data": "{\"count\":2}",
  "data": "{\"count\":1}"
}
```

## Configure projection properties

You can configure properties of the projection by updating values of the `options` object. For example, the following projection changes the name of the results stream:

```js
options({
  resultStreamName: "xboxes",
});
fromAll()
  .when({
    $init: function () {
      return {
        count: 0,
      };
    },
    ItemAdded: function (s, e) {
      if (e.body.Description.indexOf("Xbox One S") >= 0) {
        s.count += 1;
      }
    },
  })
  .outputState();
```

Then send a `PUT` request to the projection you want to update:

```bash
curl -i -X PUT -d "@update-projection-options.js" http://localhost:2113/projection/xbox-one-s-counter/query?emit=true -u admin:changeit
```

:::tip
You can find all the options available in the [user-defined projections guide](/projections#user-defined-projections).
:::

Now you get the same result as above when you query the new stream name:

```bash
curl -i "http://localhost:2113/streams/xboxes?embed=body" -H "accept:application/json" -u admin:changeit | grep data
```

## The number of items per shopping cart

The example in this step so far relied on a global state for the projection, but what if you wanted a count of the number of items in the shopping cart per shopping cart?

EventStoreDB has a built-in `$by_category` projection that lets you select events from a particular list of streams. Enable this projection with the following command:

```bash
curl -i -d{} http://localhost:2113/projection/%24by_category/command/enable -u admin:changeit
```

The projection links events from existing streams to new streams by splitting the stream name by a separator. You can configure the projection to specify the position of where to split the stream `id` and provide a separator.

By default, the category splits the stream `id` by a dash. The category is the first string.

| Stream Name        | Category                               |
| ------------------ | -------------------------------------- |
| shoppingCart-54    | shoppingCart                           |
| shoppingCart-v1-54 | shoppingCart                           |
| shoppingCart       | _No category as there is no separator_ |

Let's define a projection that produces a count per stream for a category, but the state needs to be per stream. To do so, use `$by_category` and its `fromCategory` API method.

Below is the projection:

```js
fromCategory("shoppingCart")
  .foreachStream()
  .when({
    $init: function () {
      return {
        count: 0,
      };
    },
    ItemAdded: function (s, e) {
      s.count += 1;
    },
  });
```

Create the projection with a `POST` request to the `continuous` projection resource:

```bash
curl -i --data-binary "@shopping-cart-counter.js" http://localhost:2113/projections/continuous?name=shopping-cart-item-counter%26type=js%26enabled=true%26emit=true%26trackemittedstreams=true -u admin:changeit
```

Querying for the state of this projection is different due to the partitioning of the projection. You have to specify the partition and the name of the stream.

```bash
curl -i http://localhost:2113/projection/shopping-cart-item-counter/state?partition=shoppingCart-b989fe21-9469-4017-8d71-9820b8dd1164 -u "admin:changeit"
```

The server then returns the state for the specified partition:

```json
{
  "count": 2
}
```
