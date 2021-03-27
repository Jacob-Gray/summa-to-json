# summa-to-json

This is the HTML source and JS parser for summa.json.

The source version used is the Benziger Bros. edition, 1947. Note that the parsing did not change any content, all data is straight from the HTML source. Some files might be missing content as I fix the edge cases with the compiler.

## The JSON format
The parser generates 3 different levels of JSON:
- File by file, with each file containing a "Question" as defined by the HTML source.
- Part by part, stored as `${partName}-ALL.json`.
- Everything in a 20MB JSON file. Stored as simply `ALL.json`.

The JSON format itself is rather straightforward, a cursory glance over any of the files should give you an understanding of the structure. The several oddities to it are the `outer`, `editor` and `prologue`:
- `outer` is simply the "question wrapper" content, such as the page title and brief intro if it has one.
- `editor` is when the editor of the version inserted content. To my knowledge, this happens in a single file.
- `prologue` is a prologue to a part. To my knowledge there are two of these.

All three of these share very similar structure, and simply bear a naming difference for context to the data. It's also possible for multiple of them to appear in a single file/question.

## Running the parser
You shouldn't need to run the parser itself, it's not as if the source changes very often. However, if you for some reason want to do so, it's incredibly simple:
- Run `npm i`
- Run `node htmlToJson`
- Wait while it crunches 20MB of HTML.
- The `JSONOutput` folder will contain all of the formatted JSON files.
