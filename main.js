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
    "fVNNj9owFLxX6n+wfCdxskAaC6go9AOJQkRoD71Urv1SLMV2aju79N/XycIqldqcLNkz82bee144puqGrlt/0Sf41YLz6Kpq7Wj/sMSt1dQwJx3VTIGjntNy/XlP04jQxhpvuKnxgDLOYM6B9dJojHbbJT4e3u+PH3eH729InpGsIuSBsJkgZJ4SnotcVHlWzdOMVZALztMpRl/BusBf4iCHUWHNoxRgD6HSEpcF8iFA0HauhZ12nmkfkCSZTkg2Sebn9IHOUjqdfcNoG5BSM9+LXbxvaBxL0URwZaqpIeJGxWV5LME+Sg5Rc2n6cn3gd1ILqX+OZ/3xDHL00/lcTIpjecZofc+/Mdq1CuxN/stp/2LC/e1BgDJJHLTg2pl4y7jDq9evEFp07aZ9VLsa4yrwTDDPOvoiHrJeZBradXC3LUwt+W/0wVjF/P/jJVHS30gxqXooBcVkvRbCgnMhZl2bp40F5sNUvG0Bx8Nat0UD0a9daIWHq0cboxpmpevmEUJw/xzzHnSI3dRhkU5QrUZ3jVPe4cJ1EY4nY0U3P+Ch8Nky7Rpj/a0f/xTvHccjlgPi/j78QKs/";

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
    {
      console.log("codes: " + codes);
      return codes[0].innerText;
    }
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
