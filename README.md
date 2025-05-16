# takeout

## Installation

To install the library, use npm or yarn:

```sh
npm install takeout
# or
yarn add takeout
```

## Usage

The `takeout` function is the entry point to the library. It accepts a string URI and an object of options, and returns a `Resource` object with methods for `create`, `read`, `update`, and `delete`.

### Example

```javascript
import { takeout } from 'takeout';

const uri = 'https://api.example.com/resource';
const options = { headers: { 'Authorization': 'Bearer token' } };

const resource = takeout(uri, options);

// Create a new resource
resource.create({ name: 'New Resource' }).then(response => {
  console.log(response);
});

// Read the resource
resource.read().then(collection => {
  console.log(`Collection length: ${collection.length}`);
  for (let item of collection) {
    console.log(item);
  }
});

// Update the resource
resource.update({ name: 'Updated Resource' }).then(response => {
  console.log(response);
});

// Delete the resource
resource.delete().then(response => {
  console.log(response);
});
```

## API

### `takeout(uri: string, options: object): Resource`

Creates a new `Resource` object.

#### Parameters

- `uri` (string): The URI of the resource.
- `options` (object): An object containing options for the resource.

#### Returns

- `Resource`: A `Resource` object with methods for `create`, `read`, `update`, and `delete`.

### `Resource`

A class representing a resource.

#### Methods

- `create(data: any): Promise<any>`: Creates a new resource.
- `read(): Promise<any>`: Reads the resource and returns a collection.
- `update(data: any): Promise<any>`: Updates the resource.
- `delete(): Promise<any>`: Deletes the resource.

### `Collection`

A class representing a collection of objects.

#### Properties

- `length`: Returns the length of the collection.

#### Methods

- `[Symbol.iterator](): Iterator<object>`: Iterates over the collection.
