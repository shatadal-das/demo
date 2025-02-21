"use client";
import useFormWithStorage from "@/hooks/use-form-with-storage";
import { z } from "zod";

const formSchema = z.object({
  name: z.string(),
});

export default function Home() {
  const { register, onSubmit } = useFormWithStorage(
    formSchema,
    "form-storage-key",
    (data) => {
      console.log(data);
    }
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-white">
          Form value doesn&apos;t persist
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            {...register("name")}
            className="w-full border border-gray-700 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
            placeholder="Enter your name"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[rgb(250,245,209)] to-[rgb(162,124,83)] bg-[linear-gradient(to_right, rgb(250, 245, 209), rgb(162, 124, 83))] text-[rgb(12,10,9)] font-semibold hover:brightness-90 py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
