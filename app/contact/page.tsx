import { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
    title: "Contact - Shortlist",
    description:
        "Get in touch with the Shortlist team — questions, suggestions, or problems with the app.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-3">Get in touch</h1>
                <p className="text-muted-foreground mb-10">
                    Questions, suggestions, or something not working right? Send us a
                    message and we&apos;ll get back to you at the email you provide.
                </p>
                <ContactForm />
            </main>
            <Footer />
        </div>
    );
}
