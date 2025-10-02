import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex flex-col w-full px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
        <div className="flex flex-col gap-4 flex-1 justify-center items-center sm:justify-start sm:items-start">
          <div className="flex gap-2">
            <Image
              src="/sparkdo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            <h2 className="text-2xl font-bold">Sparkdo</h2>
          </div>
          <p className="max-w-md">
            Beautiful & intuitive to-do app to organize your life
          </p>
        </div>
        <div className="flex gap-4 justify-around flex-1">
          <div className="flex flex-col gap-2">
            <p className="font-bold mb-2">Resources</p>
            <Link href="/">Blog</Link>
            <Link href="/">Help Center</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-bold mb-2">Company</p>
            <Link href="/">About</Link>
          </div>
        </div>
      </div>

      <hr className="w-full border-t my-4" />
      <div className="flex justify-between text-xs py-4">
        <p>&copy; {new Date().getFullYear()} Sparkdo. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/">Terms and Conditions</Link>
          <Link href="/">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
