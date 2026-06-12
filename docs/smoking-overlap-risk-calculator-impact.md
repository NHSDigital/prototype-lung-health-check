# Impact of concurrent and consecutive tobacco smoking on LLP and PLCO risk inputs

This note looks at how smoking cigarettes and roll-ups at the same time, rather than one after the other, can affect lung cancer risk scores in the LLP and PLCO risk calculators.

It is not clinical guidance. It is a modelling note for the v4.1, v4.2 and v4.3 prototype questions.

## Summary

Concurrent smoking means the person smokes more tobacco in the same calendar years. Consecutive smoking means the person smokes for more calendar years, but not necessarily more tobacco overall.

For risk calculators this matters because:

- **LLP/LLPv2 is mainly sensitive to smoking duration**, not separate daily quantities. If 2 tobacco products overlap, the overlapping years should usually be counted once, not once per product.
- **PLCOm2012 is sensitive to both smoking intensity and smoking duration**. If 2 tobacco products overlap, the daily cigarette-equivalent amount should be added together for those overlapping years.

For v4.1 and v4.2, the issue is that they collect one overall smoking duration and then ask about each tobacco type's frequency and quantity. That can support LLPv2 if the overall duration means "years when the person smoked any tobacco", but it is not enough to safely distinguish concurrent from consecutive product use for PLCOm2012.

For v4.3, the issue changes. It asks duration questions for each selected tobacco type, so we can start to identify overlap. This means we should avoid simply adding the number of years for each selected tobacco type. That would double-count overlapping periods.

## Prototype data capture

### v4.1

The v4.1 prototype collects smoking duration as one overall smoking history before the tobacco type loop:

- age started smoking
- age stopped smoking, where relevant
- total periods stopped smoking for 1 year or longer

It then collects tobacco type, smoking status, frequency, quantity and changed-use details for each selected tobacco product.

This means v4.1 can tell that someone smoked cigarettes and roll-ups, and can collect an amount for each product. It cannot tell whether those products were smoked:

- at the same time
- one after the other
- partly overlapping
- for different start and stop periods

### v4.2

The v4.2 prototype keeps the same calculation limitation as v4.1. It groups the duration questions into a `smoking-duration` page and groups frequency and quantity into `tobacco-smoking` pages, but duration is still collected as one overall smoking history before the per-product tobacco loop.

So v4.2 also relies on the user giving a correct overall calendar duration for all tobacco smoking. It cannot build a reliable product-by-product calendar timeline for concurrent or consecutive tobacco use.

### v4.3

The v4.3 prototype asks:

- whether someone has ever smoked tobacco
- the types of tobacco smoked for 1 year or longer
- for each selected tobacco type:
  - age started smoking that type
  - age quit smoking that type, where relevant
  - stopped periods of 1 year or longer
  - smoking frequency
  - smoking quantity
  - whether the amount changed over time

This supports a better calculation than a single "years smoked" field, because it can identify overlap between tobacco types.

### Cigarette-equivalent conversions

The prototypes ask roll-up quantity as bands of grams of rolling tobacco, not as a number of roll-ups. For the roll-up worked example, we use these product decisions:

- 1 roll-up = 0.5g of rolling tobacco
- 1 roll-up = 2 cigarette-equivalents

This means:

```text
rolling tobacco cigarette-equivalents per day = (grams per day / 0.5) x 2
                                              = grams per day x 4
```

For the large cigar worked example, we use this product decision:

- 1 large cigar = 4 cigarette-equivalents

## Calculator inputs affected

### LLP and LLPv2

LLP uses smoking duration as a risk factor. The original LLP model groups smoking duration into bands. Published coefficients for smoking duration include:

| Smoking duration | Model coefficient |
| --- | ---: |
| Never | 0 |
| 1 to 19 years | 0.769 |
| 20 to 39 years | 1.452 |
| 40 to 59 years | 2.507 |
| 60 years or more | 2.724 |

LLPv2 was adapted for UK lung screening use. It includes smoking duration and treats cigar and pipe smoking as conferring an identical risk to cigarette smoking. NHS England's Targeted Lung Health Checks protocol lists LLPv2 factors including age, gender, smoking duration, respiratory conditions, asbestos exposure, previous malignancy and family history.

For concurrent tobacco use, the smoking duration input should be the **union of smoking years**, not the sum of per-product durations.

For LLPv2, cigarette-equivalent quantity is useful for normalising different products into a consistent tobacco exposure, but the public LLPv2 descriptions do not expose a separate cigarettes-per-day or pack-years term equivalent to PLCOm2012. The main overlap issue is therefore duration: how many calendar years the person smoked any relevant tobacco.

### PLCOm2012

PLCOm2012 estimates 6-year lung cancer risk. The smoking inputs are:

- smoking status
- average number of cigarettes smoked per day
- duration smoked in years
- years since quitting

The published implementation uses smoking intensity and duration separately, rather than using pack-years alone. Because of that, 2 histories with the same pack-years can produce different PLCOm2012 scores if one has higher intensity over fewer years and the other has lower intensity over more years.

For concurrent tobacco use, the smoking intensity input should be the **sum of cigarette-equivalent tobacco used in the same period**.

## Worked example 1: cigarettes and roll-ups

Assume:

- current age: 65
- current smoker
- White ethnicity/race input for PLCOm2012
- education level: 4
- BMI: 27
- no COPD
- no personal cancer history
- no family history of lung cancer
- no quit time, because the person currently smokes
- 1 roll-up = 0.5g of rolling tobacco
- 1 roll-up = 2 cigarette-equivalents

Smoking pattern:

- cigarettes: 10 cigarettes per day
- roll-ups: 5 roll-ups per day
- rolling tobacco: 5 roll-ups x 0.5g = 2.5g per day
- roll-up cigarette-equivalent: 5 roll-ups x 2 = 10 cigarettes per day

So when cigarettes and roll-ups are smoked concurrently:

```text
total cigarette-equivalent intensity = 10 + (5 x 2)
                                    = 20 cigarettes per day
```

The same calculation can be made from grams:

```text
rolling tobacco cigarette-equivalents = 2.5g x 4
                                      = 10 cigarettes per day

total cigarette-equivalent intensity = 10 + 10
                                    = 20 cigarettes per day
```

So the exact worked PLCOm2012 numbers do not change. The new information explains how to derive the same cigarette-equivalent value from grams.

In v4.3, 2.5g would fall into the "Less than 10g" rolling tobacco answer band. That band is too broad to calculate an exact PLCOm2012 smoking intensity unless the implementation applies a representative value for the band.

## Comparing concurrent and consecutive use

To isolate the effect of overlap, compare 2 histories with the same total cigarette-equivalent exposure:

| Scenario | History | Calendar smoking duration | Average cigarette-equivalent intensity | Pack-years |
| --- | --- | ---: | ---: | ---: |
| Concurrent | 10 cigarettes/day and 5 roll-ups/day for 15 years | 15 years | 20/day | 15 |
| Consecutive | 10 cigarettes/day for 15 years, then 5 roll-ups/day for 15 years | 30 years | 10/day | 15 |

Both histories have the same total cigarette-equivalent exposure. If we express that exposure as pack-years, they both equal 15 pack-years.

Pack size is only needed for the pack-year conversion. It is not needed if the calculation uses cigarette-equivalents per day and smoking duration directly.

In this comparison, pack-years means:

```text
(cigarette-equivalents smoked per day / 20 cigarettes in a pack) x smoking duration in years
```

```text
concurrent pack-years = (20 / 20) x 15 = 15
consecutive pack-years = (10 / 20) x 30 = 15
```

But the risk models do not treat them identically.

## LLP impact

Using the original LLP smoking-duration bands:

| Scenario | Smoking duration input | LLP smoking-duration band | Smoking-duration coefficient |
| --- | ---: | --- | ---: |
| Concurrent | 15 years | 1 to 19 years | 0.769 |
| Consecutive | 30 years | 20 to 39 years | 1.452 |

In LLP, the consecutive history has the higher smoking-duration contribution because it spans more calendar years. The concurrent history should not be counted as 30 years just because there are 15 years of cigarettes and 15 years of roll-ups. Those years overlap.

If overlapping product histories were summed incorrectly, the concurrent example would be moved from the 1 to 19 year band to the 20 to 39 year band. That would overstate the smoking-duration part of the LLP score.

## LLPv2 impact

For LLPv2, the analysis changes in 2 ways:

1. LLPv2 broadens what counts in the smoking history. The UKLS documentation says LLPv2 added pipes and cigars alongside cigarettes and treated cigar and pipe smoking as conferring an identical risk to cigarette smoking.
2. LLPv2 does not appear, from public documentation, to use a separate intensity term like PLCOm2012. That means concurrent smoking does not increase the LLPv2 score simply because the person smoked more cigarette-equivalents per day in the same years.

For the roll-up worked example:

| Scenario | Calendar smoking duration | Cigarette-equivalent intensity | LLPv2 smoking impact |
| --- | ---: | ---: | --- |
| Concurrent | 15 years | 20/day | Lower duration contribution |
| Consecutive | 30 years | 10/day | Higher duration contribution |

So, for LLPv2, the consecutive history is more likely to score higher than the concurrent history because it has more calendar years of smoking.

If the 2 histories had the same calendar smoking duration, LLPv2 would not distinguish them through intensity in the way PLCOm2012 does. For example, 15 years at 20 cigarette-equivalents per day and 15 years at 10 cigarette-equivalents per day would have the same LLPv2 smoking-duration input, assuming both meet the relevant smoking threshold.

The NIHR UKLS appendix also says start and stop smoking ages were grouped into 10-year bands for the LLP risk algorithm. That means small differences around age-band boundaries can affect the calculated LLPv2 risk in the live implementation. The public appendix does not provide enough detail to calculate an exact LLPv2 percentage for the worked example here.

## PLCOm2012 impact

Using the PLCOm2012 formula with the assumptions above:

| Scenario | PLCO smoking intensity input | PLCO duration input | PLCOm2012 6-year risk |
| --- | ---: | ---: | ---: |
| Concurrent | 20 cigarettes/day | 15 years | 1.35% |
| Consecutive | 10 cigarettes/day | 30 years | 0.88% |

In this example, PLCOm2012 gives the concurrent history the higher score, despite the shorter duration, because its smoking-intensity term is non-linear and the jump from 10 to 20 cigarettes per day is large enough to outweigh the longer duration in the consecutive example.

This is why a pack-year-only transformation is not enough for PLCOm2012. The 2 scenarios both equal 15 pack-years, but they produce different PLCOm2012 scores.

## Worked example 2: cigarettes and large cigars

Use the same baseline person as the first example, but change the tobacco pattern:

- cigarettes: 10 cigarettes per day
- large cigars: 1 large cigar per week
- large cigar cigarette-equivalent: 1 large cigar x 4 = 4 cigarette-equivalents per week

So when cigarettes and large cigars are smoked concurrently:

```text
large cigar daily average = 4 / 7
                          = 0.57 cigarette-equivalents per day

total cigarette-equivalent intensity = 10 + 0.57
                                    = 10.57 cigarette-equivalents per day
```

To isolate the effect of overlap, compare 2 histories with the same total cigarette-equivalent exposure:

| Scenario | History | Calendar smoking duration | Average cigarette-equivalent intensity | Pack-years |
| --- | --- | ---: | ---: | ---: |
| Concurrent | 10 cigarettes/day and 1 large cigar/week for 15 years | 15 years | 10.57/day | 7.93 |
| Consecutive | 10 cigarettes/day for 15 years, then 1 large cigar/week for 15 years | 30 years | 5.29/day | 7.93 |

The consecutive average intensity is:

```text
((10 x 15) + (0.57 x 15)) / 30 = 5.29 cigarette-equivalents per day
```

Both histories have the same pack-years:

```text
concurrent pack-years = (10.57 / 20) x 15 = 7.93
consecutive pack-years = (5.29 / 20) x 30 = 7.93
```

For LLP and LLPv2, the impact is the same as the roll-up example. The consecutive history has the higher smoking-duration contribution because it spans 30 calendar years rather than 15.

Using the PLCOm2012 formula with the same baseline assumptions:

| Scenario | PLCO smoking intensity input | PLCO duration input | PLCOm2012 6-year risk |
| --- | ---: | ---: | ---: |
| Concurrent | 10.57 cigarette-equivalents/day | 15 years | 0.60% |
| Consecutive | 5.29 cigarette-equivalents/day | 30 years | 0.17% |

If v4.1 or v4.2 simply added the cigarette and large cigar amounts and applied the total to the whole 30-year duration, it could incorrectly treat the consecutive history as 10.57 cigarette-equivalents per day for 30 years. That would overstate the PLCOm2012 smoking intensity for the consecutive history.

## Practical implication for v4.1 and v4.2

For LLPv2, v4.1 and v4.2 are probably workable if the single duration answer is treated as the number of calendar years when the person smoked any relevant tobacco.

The same duration pattern applies to both worked examples. For example:

| Scenario | True history | v4.1/v4.2 duration answer needed for LLPv2 |
| --- | --- | ---: |
| Concurrent | cigarettes and roll-ups for the same 15 years | 15 years |
| Consecutive | cigarettes for 15 years, then roll-ups for 15 years | 30 years |

For PLCOm2012, v4.1 and v4.2 are riskier. If a calculation simply adds cigarette-equivalent quantities across products and applies the total to the whole smoking duration, it assumes the products were smoked concurrently for the whole period.

That assumption is correct for the concurrent example:

```text
20 cigarette-equivalents per day for 15 years
```

But it would overstate the consecutive example if it turned this:

```text
10 cigarette-equivalents per day for 30 years
```

into this:

```text
20 cigarette-equivalents per day for 30 years
```

So v4.1 and v4.2 support LLPv2 better than PLCOm2012 for multi-product tobacco histories. They do not collect enough timing detail to reliably distinguish concurrent from consecutive tobacco use when deriving the PLCOm2012 intensity input.

The grams conversion does not fix this timing problem. It only makes the rolling tobacco amount computable as cigarette-equivalents:

```text
2.5g rolling tobacco per day x 4 = 10 cigarette-equivalents per day
```

v4.1 and v4.2 would still need to know whether that 2.5g per day was smoked during the same years as the cigarettes or during different years.

## Practical implication for v4.3

For someone who smokes cigarettes and roll-ups, we should calculate a calendar timeline:

1. Convert each tobacco type to a cigarette-equivalent amount.
2. For each calendar year, add together the cigarette-equivalent amounts smoked in that year.
3. Count smoking duration as the number of calendar years with any qualifying smoking.
4. Derive average cigarettes per day across those smoking years for PLCOm2012.
5. Use the calendar duration, not the sum of product durations, for LLP/LLPv2.

For the example:

```text
Concurrent:
15 calendar years with smoking
20 cigarette-equivalents per day

Consecutive:
30 calendar years with smoking
10 cigarette-equivalents per day
```

For rolling tobacco, the conversion step is:

```text
grams of rolling tobacco per day x 4 = cigarette-equivalents per day
```

If the input is a band, such as "Less than 10g", the implementation needs a clear rule for choosing a representative value before it can calculate PLCOm2012. For LLPv2, the exact gram amount is less important than the calendar duration, assuming the person meets the relevant smoking threshold.

## Critique

This answer is useful for explaining the direction of impact, but it has limitations:

- It uses a simplified 2-product example and assumes stable daily use over whole years.
- It uses the original LLP published smoking-duration bands to explain the effect. LLPv2 and programme implementations may have operational details that are not fully visible in public calculator documentation.
- It assumes 1 roll-up equals 0.5g of rolling tobacco, 1 roll-up equals 2 cigarette-equivalents, and 1 large cigar equals 4 cigarette-equivalents because those values were specified for this analysis. If any conversion changes, the PLCOm2012 intensity examples change.
- The prototype currently asks rolling tobacco quantity in grams bands. A band such as "Less than 10g" does not provide an exact gram value, so an implementation would need a reliable representative value or a more precise input before calculating PLCOm2012.
- It calculates PLCOm2012 for a specific baseline person. Changing age, BMI, ethnicity/race, education, COPD, cancer history or family history changes the absolute percentages, although the overlap issue remains.
- It treats v4.1 and v4.2 as data-capture designs rather than implemented calculator logic. If a downstream calculator made additional assumptions or asked follow-up questions outside the prototype, the impact could change.
- It does not address changed smoking amounts over time beyond the simple concurrent/consecutive comparison. Real histories may need year-by-year segments.

## Sources

- NHS England, [Standard protocol prepared for the Targeted Lung Health Checks Programme](https://www.england.nhs.uk/wp-content/uploads/2019/02/B1646-standard-protocol-targeted-lung-health-checks-programme-v2.pdf), lists LLPv2 and PLCOm2012 thresholds and factors.
- Cassidy et al., [The LLP risk model: an individual risk prediction model for lung cancer](https://pmc.ncbi.nlm.nih.gov/articles/PMC2361453/), describes the original LLP model and smoking-duration coefficients.
- Raji et al., [Predictive Accuracy of the Liverpool Lung Project Risk Model](https://pmc.ncbi.nlm.nih.gov/articles/PMC3723683/), validates the LLP model and publishes smoking-duration coefficients.
- NIHR Journals Library, [Details of the Liverpool Lung Project risk model version 2](https://www.ncbi.nlm.nih.gov/books/NBK362751/?report=printable), describes LLPv2 adaptations used in UKLS.
- Tammemagi et al., [Selection Criteria for Lung-Cancer Screening](https://pmc.ncbi.nlm.nih.gov/articles/PMC3929969/), describes PLCOm2012 predictors and the handling of smoking intensity and duration.
- resplab, [PLCOm2012 R implementation](https://rdrr.io/github/resplab/PLCOm2012/src/R/plcom2012.R), gives the formula used for the PLCOm2012 worked calculation.
