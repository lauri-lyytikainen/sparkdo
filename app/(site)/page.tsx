import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Site() {
  return (
    <div>
      <div className="flex-col w-full">
        <div className=" flex flex-col text-center items-center my-40 gap-8">
          <h1 className="text-4xl font-bold">
            Your Tasks, <span className="text-primary">
              Sparked to Life
            </span>
          </h1>
          <h2 className="text-2xl font-bold">
            The beautiful, intuitive to-do app that helps you achieve more
          </h2>
          <div>
            <Button size="lg" className="font-bold">
              Get Started
            </Button>
          </div>
        </div>
        <div className="bg-primary rounded-2xl min-h-160">

        </div>

      </div>
      <div className="flex my-8">
        <div className="flex-1 flex flex-col justify-center gap-8">
          <h2 className="text-2xl font-bold">Organize Everything, Effortlessly</h2>
          <p className="text-lg max-w-xl">
            From work projects to personal errands,
            Sparkdo makes it simple to capture, organize,
            and prioritize every task.
            Get your thoughts out of your head and into a system you can trust.
          </p>
        </div>
        <div
          className="relative flex-1 min-h-80">
          <Image
            src={"/images/todo-list.svg"}
            alt="To-do list illustration"
            fill
          />
        </div>
      </div>

    </div>
  )
}
