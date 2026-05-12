import { Whop } from "@whop/sdk";

const whop = new Whop({ apiKey: "apik_5Qw0ZrY2fPC0u_C5094786_C_12d55b2949755211f1549ae8019a2410c1716a090a28264cf42cc0c0fc6f3e" });

async function run() {
    try {
        console.log("Fetching company...");
        const companies = await whop.companies.list();
        console.log("Companies:", companies.data.map(c => ({id: c.id, name: c.title})));
        
        if (companies.data.length > 0) {
            const companyId = companies.data[0].id;
            console.log("Company ID:", companyId);
            
            console.log("Fetching plans for company...");
            const plans = await whop.plans.list({ company_id: companyId });
            console.log("Plans:");
            for (const p of plans.data) {
                console.log(`Plan ID: ${p.id}, Period: ${p.billing_period}, Price: ${p.initial_price}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}
run();
