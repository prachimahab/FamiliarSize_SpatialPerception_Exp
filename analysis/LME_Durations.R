# load LME package
library('lme4')
library(nlme)
library('lmerTest')
library('partR2') # https://cran.r-project.org/web/packages/partR2/vignettes/Using_partR2.html
library(AICcmodavg)
library(MuMIn)
library(multilevel) 
library('r2glmm')

library(dplyr)
library(ggplot2)
library(emmeans)

# Load data
setwd("/Users/prachimahableshwarkar/Documents/GW/Depth_MTurk/familiarSize/data/")

df_subj_125 <- read.csv('tx-MX-data-125ms.csv')

df_subj_250 <- read.csv('tx-MX-data-250ms.csv')

df_subj_1000 <- read.csv('tx-MX-data-1000ms.csv')

# Combine the data frames by rows
combined_df <- rbind(df_subj_125, df_subj_250, df_subj_1000)


combined_df$subjID <- factor(combined_df$subjID)
combined_df$duration <- factor(combined_df$duration)
combined_df$stimulus <- factor(combined_df$stimulus)


mod_main <- lmer(zs_depth_estimates ~  scale + condition + duration + scale*condition*duration + (1|zs_actual_depth), data=combined_df)
summary(mod_main)

# sjPlot:: tab_model(mod_main)

anova(mod_main)

mod_main2 <- lmer(zs_depth_estimates ~  zs_actual_depth + scale + condition + duration + zs_actual_depth*scale*condition*duration + (1|subjID), data=combined_df)
summary(mod_main2)

anova(mod_main2)



# Compute the estimated marginal means for scale and condition
emm_scale = emmeans(mod_main2, ~ scale)
emm_condition = emmeans(mod_main2, ~ condition)
emm_duration = emmeans(mod_main2, ~ duration)
emm_AD = emmeans(mod_main2, ~ zs_actual_depth)

# Interaction plot
emm_interaction <- emmeans(mod_main2, pairwise ~ scale | condition | zs_actual_depth)
emm_summary <- summary(emm_interaction$emmeans)
emm_df <- as.data.frame(emm_summary)

emm_df$upper <- emm_df$emmean + emm_df$SE
emm_df$lower <- emm_df$emmean - emm_df$SE

# write.csv(emm_df, file = "/Users/prachimahableshwarkar/Documents/GW/Depth_MTurk/familiarSize/data/LME_interaction.csv", row.names = FALSE)

ggplot(emm_df, aes(x = scale, y = emmean, fill = condition)) +
  geom_bar(stat = "identity", position = position_dodge(), width = 0.7) + # Use bars to represent EMMs
  geom_errorbar(aes(ymin = lower, ymax = upper), width = 0.25, position = position_dodge(width = 0.7)) + # Add error bars
  facet_wrap(~zs_actual_depth, scales = "free_x") + # Separate plots for each depth
  theme_minimal() + # Use a minimal theme for aesthetics
  labs(x = "Scale", y = "Estimated Marginal Means", title = "Interaction Plot") +
  theme(legend.position = "bottom") # Adjust legend position


