# Cigarette equivalents

This note summarises the cigarette-equivalent conversion data in:

- `docs/cigarette-equivalents--quantity.csv`
- `docs/cigarette-equivalents--time.csv`

It is a modelling reference for converting different tobacco products into cigarette-equivalent amounts. It is not clinical guidance.

## Quantity-based products

The quantity CSV uses the `Cigarettes` column as the target cigarette-equivalent amount. The other columns show how much of each product is equivalent to that number of cigarettes.

For example, the `20` cigarette row gives:

| Product | Equivalent quantity for 20 cigarettes |
| --- | ---: |
| Cigarettes | 20 cigarettes |
| Rolling tobacco | 10 roll-ups |
| Small cigar | 13.3 small cigars |
| Medium cigar | 10 medium cigars |
| Large cigar | 5 large cigars |
| Pipe | 8 full pipe loads |
| Cigarillo | 10 cigarillos |
| Heated tobacco | 20 heated tobacco sticks |

These values imply the following cigarette-equivalent factors:

| Product | Input unit | Cigarette-equivalents per unit |
| --- | --- | ---: |
| Cigarettes | 1 cigarette | 1 |
| Rolling tobacco | 1 roll-up | 2 |
| Small cigar | 1 small cigar | 1.5 |
| Medium cigar | 1 medium cigar | 2 |
| Large cigar | 1 large cigar | 4 |
| Pipe | 1 full pipe load | 2.5 |
| Cigarillo | 1 cigarillo | 2 |
| Heated tobacco | 1 heated tobacco stick | 1 |

Use this formula for quantity-based products:

```text
cigarette-equivalents = product quantity x cigarette-equivalents per unit
```

If the product is not smoked daily, first calculate the cigarette-equivalent amount for each smoking occasion, then normalise it to an average daily amount if the risk model needs cigarettes per day.

For example:

```text
1 large cigar per week = 1 x 4 cigarette-equivalents per week
                       = 4 / 7
                       = 0.57 cigarette-equivalents per day
```

## Rolling tobacco and grams

The prototype asks about rolling tobacco in grams, but the quantity CSV maps rolling tobacco as roll-ups. Use this assumption to convert between them:

```text
1 roll-up = 0.5g rolling tobacco
```

The quantity CSV implies:

```text
1 roll-up = 2 cigarette-equivalents
```

So rolling tobacco can be converted directly from grams:

```text
roll-ups = grams of rolling tobacco / 0.5

cigarette-equivalents = roll-ups x 2
                      = (grams of rolling tobacco / 0.5) x 2
                      = grams of rolling tobacco x 4
```

Examples:

| Rolling tobacco | Roll-ups | Cigarette-equivalents |
| ---: | ---: | ---: |
| 0.5g | 1 | 2 |
| 2.5g | 5 | 10 |
| 5g | 10 | 20 |
| 7.5g | 15 | 30 |

The reverse calculation is:

```text
grams of rolling tobacco = cigarette-equivalents / 4
```

For example:

```text
20 cigarette-equivalents = 20 / 4
                         = 5g rolling tobacco
```

## Time-based products

The time CSV gives cigarette-equivalents by minutes of use. Its second row defines the cigarette-equivalents per minute:

| Product | Cigarette-equivalents per minute |
| --- | ---: |
| Shisha | 1.25 |
| Chewing tobacco | 0.133 |
| Dry snuff | 0.133 |

Use this formula for time-based products:

```text
cigarette-equivalents = minutes of use x cigarette-equivalents per minute
```

Selected examples from the CSV:

| Time | Shisha | Chewing tobacco | Dry snuff |
| ---: | ---: | ---: | ---: |
| 10 minutes | 12.5 | 1.33 | 1.33 |
| 30 minutes | 37.5 | 3.99 | 3.99 |
| 60 minutes | 75 | 7.98 | 7.98 |
| 120 minutes | 150 | 15.96 | 15.96 |
| 180 minutes | 225 | 23.94 | 23.94 |

The CSV stores chewing tobacco and dry snuff values to 3 decimal places before display in the minute rows.

## Applying the conversions

To calculate a total cigarette-equivalent amount for a smoking period:

1. Convert each selected tobacco product into cigarette-equivalents.
2. Normalise each product to the same time period, usually an average per day.
3. Add product amounts only where they are smoked during the same calendar period.
4. Keep smoking duration as calendar years with tobacco use, not the sum of per-product durations.

For example, someone who smokes 10 cigarettes per day and 2.5g rolling tobacco per day has:

```text
cigarettes = 10 cigarette-equivalents per day

rolling tobacco = 2.5g x 4
                = 10 cigarette-equivalents per day

total = 10 + 10
      = 20 cigarette-equivalents per day
```

If those products were smoked concurrently, the daily cigarette-equivalent amounts should be added for the overlapping years. If they were smoked consecutively, calculate separate periods before deriving any average intensity.

## Data notes

- The v4.1, v4.2 and v4.3 prototype tobacco type lists do not currently include heated tobacco, chewing tobacco or dry snuff.
- Heated tobacco appears in the quantity CSV only. Chewing tobacco and dry snuff appear in the time CSV only.
- The prototype's rolling tobacco question uses gram bands, such as `Less than 10g` and `10g to 30g`. A calculator needs a representative gram value, or a more precise input, before it can calculate an exact cigarette-equivalent amount from those bands.
- The prototype's shisha question uses time bands, such as `Up to 30 minutes` and `30 minutes to 1 hour`. A calculator needs a representative minute value, or a more precise input, before it can calculate an exact cigarette-equivalent amount from those bands.
- The `1` cigarette row in `docs/cigarette-equivalents--quantity.csv` lists rolling tobacco as `2`. That does not match the rest of the rolling tobacco column, where the equivalent roll-up quantity is `cigarettes / 2`. With `1 roll-up = 0.5g` and `1 roll-up = 2 cigarette-equivalents`, the expected equivalent for `1` cigarette would be `0.5` roll-ups, or `0.25g` rolling tobacco.
