# paper-client-js

The Typescript [PaperCache](https://papercache.io) client. The client supports all commands described in the wire protocol on the homepage.

## Example
```javascript
import { PaperClient } from "paper-client";

const client = await PaperClient.connect("paper://127.0.0.1:3145");

client.set("hello", "world");
const got = client.get("hello");
```
