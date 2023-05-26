/** @format */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
      busFactor: {
        general: ["The size and color of the tiles in the treemap depend on the calculated bus factor and the size of the file or folder it represents."],
        color: ["The color of the tiles indicate the bus factor of the corresponding file or folder.", "We show the color palette and the corresponding bus factor ranges in the panel. If, for a file or folder the authorship data is insufficient, or the item is trivial, the tile will be gray."],
        size: ["The tile size is proportional to the logarithm of the size of the file or folder itself.", "The size is measured in bytes. A file that is 100KB will have a tile twice as large as a file that is 10KB. Folder size is the sum of the sizes of all items in it."],
        recalculation: ["Turning this feature on will ensure that the bus factor values for the files and folders are updated everytime filters are added or removed. This option is enabled by default for the simulation mode and takes into account currently applied filters as well as authors being added or removed."],
      },
      currentPath: {
        general: ["This panel shows the path to the folder being visualized now."],
        details: ["All of the folder names in the path are clickable. Clicking on any of them will route the visualization to the contents of that specific folder."]
      },
      filters: {
        general: ["You can filter the files in two different ways. You can either manually add regular expressions or choose predefined templates for multiple regular expressions.", "After filtering, we show those files/folders that satisfy all the given regular expressions you specify for filtering"],
        regex: ["You can try out the regex you have written at this website to check whether it provides the desired results."],
        templates: ["Templates are collections of expressions that are commonly used together to focus on certain types of files. For example, you can show just the JSX JS and TSX files for a React + TypeScript project", "Predefined templates allow you to apply filters with one click instead of testing and adding regular expressions one by one"],
        links: ["https://regexr.com"]
      },
      simMode: {
        general: ["The simulation mode allows you to remove specific code authors. After removal, we visualize how the removal affects the contribution scores and the bus factor for the given project and its folders and files."],
        detail: ["We recalculate bus factor for all files and folders in the project every time whenever an author is added or removed. The calculations are based on the paper by Jabrayilzade, Evtikhiev, Tüzün, and Kovalenko, which can be found at:"],
        links:["https://arxiv.org/abs/2202.01523"]
      },
      stats: ["This panel shows authors that have contributed to the currently visualized folder or currently selected file. Together with the authors' names, we show their contribution percentage and the bus factor for the item."],
    },
  },
  ru: {
    translation: {
      busFactor: {
        color: [],
        size: [],
        recalculation: [],
      },
      currentPath: [],
      filters: {
        general: [],
        regex: [],
        templates: [],
      },
      simMode: {
        general: [],
        detail: [],
      },
      stats: [],
    },
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    returnObjects: true,
    joinArrays: "\n",
  });

export default i18n;
