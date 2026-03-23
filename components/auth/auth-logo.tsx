import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

export function AuthLogo() {
    const locale = useLocale();

    return (
        <Link href={`/${locale}`} className="flex items-center justify-center gap-3">
            {/* Logo Container */}
            <div className="flex h-12 w-12 items-center justify-center">
                <Image src="/apple-icon.png" alt="Logo" width={32} height={32} />
            </div>

            {/* Branding Text */}
            <div className="flex items-baseline">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                    LexiVocab<span className="text-primary">.</span>
                </span>
            </div>
        </Link>
    );
}
