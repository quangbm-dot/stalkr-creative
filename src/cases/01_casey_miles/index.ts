import { buildStoryCase, type StoryJson } from "../buildStoryCase";
import data from "./story.json";

const images = import.meta.glob<string>("./img/*.webp", { eager: true, import: "default" });

export default buildStoryCase("01_casey_miles", data as unknown as StoryJson, images);
