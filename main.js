// This is the main Node.js source code file of your actor.
// It is referenced from the "scripts" section of the package.json file,
// so that it can be started by running "npm start".

// Import Apify SDK. For more information, see https://sdk.apify.com/
const Apify = require("apify");

Apify.main(async () => {
  // Get input of the actor (here only for demonstration purposes).
  // If you'd like to have your input checked and have Apify display
  // a user interface for it, add INPUT_SCHEMA.json file to your actor.
  // For more information, see https://docs.apify.com/actors/development/input-schema
  const input = await Apify.getInput();
  console.log("Input:");
  console.dir(input);
  //   let input = {};
  //   input.url = "https://developer.pingidentity.com/en/tools/saml-decoder.html";

  if (!input || !input.url)
    throw new Error('Input must be a JSON object with the "url" field!');

  console.log("Launching Puppeteer...");
  const browser = await Apify.launchPuppeteer();

  console.log(`Opening page ${input.url}...`);
  const page = await browser.newPage();

  await page.goto(input.url);

  page.once("load", () => console.log("Page loaded!"));

  const title = await page.title();
  console.log(`Title of the page "${input.url}" is "${title}".`);

  console.log("Saving output...");
  await Apify.setValue("OUTPUT", {
    title,
  });

  const samlRequest =
    "fVNNj9MwFLwj8R8s35s42X4oVltUWgGVlt2oCRy4IGO/UEvxB7azW/49TrZdBQlysmTPzJt573ntmWot3XXhrE/wqwMf0EW12tPhYYM7p6lhXnqqmQJPA6fV7vM9zRNCrTPBcNPiEWWawbwHF6TRGB0PG1weHz5+J6RYkVVDyB1hC0HIMie8EIVoilWzzFesgUJwns8x+grOR+4GRymMSmeepAD3EKtscFWiEM1HXe87OGofmA4RSbL5jKxm2bLO7+gip/PFN4wOESk1C4PYOQRL01QKm8CFKdtCwo1Kq+qxAvckOST2bIdyQ9j3Ugupf07n/PEC8vRTXZez8rGqMdrdsu+N9p0Cd5X/crp/NeH/9iBAmSyNWnDpTbxj3OPt2zcIrftW0yGq205xFQQmWGA9fZ2OWa8ylvYdPB5K00r+G30wTrHw/3hZkg03UsyaAUpBMdnuhHDgfYzZtuZ574CFOJXgOsDpuNZ1yUAMKxdbEeAS0N4oy5z0/TxiCB5eYt6CjrH7Ni7RCZrt5J5xyntcvC7j8Wyc6OcHPBauHdPeGheu/fin+OA4nbAcEbf38efZ/gE=";

  // Fill form fields and select desired search options
  console.log("Fill in search form");
  await page.type("#saml", samlRequest);

  // Submit the form and wait for full load of next page
  console.log("Submit search form");
  await Promise.all([page.click('.MuiButton-contained, [type="submit"]')]);

  page
    .waitForSelector(".MuiBox-root > pre > code")
    .then(() => console.log("decoded saml ready!"));

  //   let code = await page.$(".MuiBox-root > pre > code");

  //   console.log("code");
  //   console.log(code);

  // Obtain and print list of search results
  const decodedSAML = await page.$$eval(".MuiBox-root > pre > code", (codes) =>
    // should only be one in the codes array using the selector chosen, the decoded saml output
      codes[0].innerText

  );

  if (!decodedSAML)
    throw new Error("Didn't receive decoded saml for some reason");

  console.log("Decoded SAML: ", decodedSAML);

  // Store data in default dataset
  await Apify.pushData({ decodedSAML: decodedSAML });

  console.log("Closing Puppeteer...");
  await browser.close();

  console.log("Done.");
});
