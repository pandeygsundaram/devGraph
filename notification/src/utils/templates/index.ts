import { TemplateMap, EmailTemplateType } from "./types";
import { generalTemplates } from "./general.template";

export const mailTemplates: {
  // This type definition ensures that any key from EmailTemplateType
  // corresponds to the correct function signature from TemplateMap.
  [K in EmailTemplateType & keyof TemplateMap]: (data: TemplateMap[K]) => {
    subject: string;
    body: string;
  };
} = {
  // The spread operator is used here to merge all the template objects
  // from the individual files into one comprehensive object.

  ...generalTemplates,
};

// Re-exporting the main types for convenience, so they can be
// imported from this central file instead of from './types'.
export type { EmailTemplateType, TemplateMap };
