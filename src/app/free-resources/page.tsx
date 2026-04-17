import FreeResourcesClient from "./free-resources-client";
import { getFreeResourcesFromStoryblok } from "@/infrastructure/storyblok/freeResourcesStoryblok";

export default async function FreeResourcesPage() {
  const { title: pageTitle, resources } = await getFreeResourcesFromStoryblok();
  return <FreeResourcesClient pageTitle={pageTitle} {...(resources.length > 0 ? { resources } : {})} />;
}
