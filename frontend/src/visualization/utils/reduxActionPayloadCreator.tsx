/** @format */

type SimpleKeyValueObject = { [propertyName: string]: Object };

export const payloadGenerator = (propertyName: string, propertyValue: Object): SimpleKeyValueObject  => {
  return {
    [propertyName]: propertyValue,
  };
};
