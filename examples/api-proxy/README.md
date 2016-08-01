To use this example, rename the `usergrid.example.json` to `usergrid.json`.  
This file is located at `examples/api-proxy/config`.

**Note:** The usergrid module crawls your App file structure to find files named `usergrid.json` or a `config.json`.  If there are multiple files with one of these names present at different locations under the app, only one of them will be used and the others are ignored.  This may cause use of an unintended backend.  
