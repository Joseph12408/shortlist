const { Whop } = require("@whop/sdk");

const whop = new Whop({ apiKey: "apik_5Qw0ZrY2fPC0u_C5094786_C_12d55b2949755211f1549ae8019a2410c1716a090a28264cf42cc0c0fc6f3e" });

async function run() {
    try {
        console.log("Fetching company...");
        const company = await whop.companies.retrieve({}); // Usually this gets the current company if no ID
        console.log("Company:", company);
    } catch (e) {
        console.error("Error company:", e.message);
    }
}
run();
