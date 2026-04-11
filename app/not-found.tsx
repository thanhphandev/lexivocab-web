import Image from "next/image";
import Link from "next/link";

export default function RootNotFound() {
    return (
        <html lang="en" suppressHydrationWarning>
            <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }} suppressHydrationWarning>
                <div style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    background: "linear-gradient(to bottom, #fafafa, #f5f5f5)"
                }}>
                    <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
                        <Image
                            src="/illustrations/not-found.png"
                            alt="Page not found"
                            width={240}
                            height={240}
                            style={{ margin: "0 auto", opacity: 0.9 }}
                            priority
                        />

                        <p style={{
                            fontSize: "4.5rem",
                            fontWeight: 900,
                            color: "rgba(234, 88, 12, 0.15)",
                            margin: "1rem 0 0",
                            lineHeight: 1,
                            userSelect: "none"
                        }}>
                            404
                        </p>

                        <h1 style={{
                            fontSize: "1.75rem",
                            fontWeight: 700,
                            color: "#0a0a0a",
                            margin: "0.75rem 0 0.5rem"
                        }}>
                            Page Not Found
                        </h1>

                        <p style={{
                            color: "#737373",
                            lineHeight: 1.6,
                            maxWidth: "22rem",
                            margin: "0 auto 2rem"
                        }}>
                            Oops! The page you are looking for does not exist or has been moved.
                        </p>

                        <Link
                            href="/"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "0.75rem",
                                background: "#ea580c",
                                color: "white",
                                padding: "0.75rem 1.5rem",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
                                transition: "opacity 0.2s"
                            }}
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
