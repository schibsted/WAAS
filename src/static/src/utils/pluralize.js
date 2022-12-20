const pluralRules = new Intl.PluralRules("en-US");

const pluralize = (count, singular, plural) => {
  const rule = pluralRules.select(count);

  switch (rule) {
    case "one":
      return singular;
    case "other":
      return plural;
    default:
      throw new Error("Unknown rule output: " + rule);
  }
};

export default pluralize;
