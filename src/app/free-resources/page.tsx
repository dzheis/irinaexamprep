import FreeResourcesClient from "./free-resources-client";
import { getFreeResourcesFromStoryblok } from "@/lib/free-resources-storyblok";

export default async function FreeResourcesPage() {
  const { title: pageTitle, resources } = await getFreeResourcesFromStoryblok();
  return (
    <FreeResourcesClient
      pageTitle={pageTitle}
      resources={resources.length > 0 ? resources : undefined}
    />
  );
}
