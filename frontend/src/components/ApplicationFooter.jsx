import React from "react";
import Footer from "@jetbrains/ring-ui/dist/footer/footer";

export const ApplicationFooter = () => {

  return (
    <Footer
      className="footer"
      left={[
        [
          {
            url: 'https://github.com/JetBrains-Research/bus-factor-explorer',
            label: 'bus-factor-explorer'
          },
          ' by ICTL'
        ],
      ]}
      center={[
        {
          url: 'https://forms.gle/LAvL4ZCvQfuaSr6S9',
          label: 'Feedback',
          title: 'please, fill the form',
          target: '_blank'
        }
      ]}
      right={[
        {
          url: 'https://github.com/JetBrains-Research/bus-factor-explorer/issues',
          label: 'issues'
        }
      ]}
    />
  );
}