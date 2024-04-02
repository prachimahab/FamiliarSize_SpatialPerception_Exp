install.packages("merTools")

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
library(merTools) # For predictInterval, might need to install

# Load data
setwd("/Users/prachimahableshwarkar/Documents/GW/Depth_MTurk/familiarSize/data/")
df_subj <- read.csv('tx-MX-data-1000ms.csv')

df_subj$subjID <- factor(df_subj$subjID)
df_subj$duration <- factor(df_subj$duration)
df_subj$stimulus <- factor(df_subj$stimulus)
df_subj$condition <- factor(df_subj$condition)
df_subj$scale <- factor(df_subj$scale)


mod_main <- lmer(zs_depth_estimates ~ scale + condition + scale*condition + (1|actual_depth), data=df_subj)
summary(mod_main)

sjPlot:: tab_model(mod_main)

anova(mod_main)

mod_main2 <- lmer(zs_depth_estimates ~ zs_actual_depth*scale*condition + (1|subjID), data=df_subj)
summary(mod_main2)

sjPlot:: tab_model(mod_main2)

anova(mod_main2)

# PLOT

# Compute the estimated marginal means for scale and condition
emm_scale = emmeans(mod_main, ~ scale)
emm_condition = emmeans(mod_main, ~ condition)

# Interaction plot
emm_interaction <- emmeans(mod_main, pairwise ~ scale | condition)
emm_summary <- summary(emm_interaction$emmeans)
emm_df <- as.data.frame(emm_summary)

emm_df$upper <- emm_df$emmean + emm_df$SE
emm_df$lower <- emm_df$emmean - emm_df$SE

ggplot(emm_df, aes(x=interaction(scale, condition), y=emmean, group=condition, color=condition)) +
  geom_bar(stat="identity", position=position_dodge(width=0.8), aes(fill=condition), width=0.7) +
  geom_errorbar(aes(ymin=lower, ymax=upper), position=position_dodge(width=0.8), width=0.25) +
  labs(x="Scale and Condition", y="Estimated Marginal Mean", title="Interaction between Scale and Condition") +
  theme_minimal() +
  theme(axis.text.x=element_text(angle=45, hjust=1), legend.title=element_blank()) +
  scale_fill_brewer(palette="Pastel1") 

write.csv(emm_df, file = "/Users/prachimahableshwarkar/Documents/GW/Depth_MTurk/familiarSize/data/250ms_LME_interaction.csv", row.names = FALSE)

mean_actual_depth <- mean(df_subj$actual_depth, na.rm = TRUE)

print(levels(df_subj$scale))
# Assuming 'scale' and 'condition' are both factors in df_subj
new_df <- expand.grid(scale = c("small", "canonical", "large"),
                      condition = c("BC", "FS"),
                      # If actual_depth is a random effect and doesn't need to vary for predictions:
                      actual_depth = mean_actual_depth)

print(nrow(new_df))

predicted_values <- predict(mod_main, newdata = new_df, re.form = NULL)
print(length(predicted_values))

# Correct assignment
new_df$predicted <- predicted_values

head(n_df_debug)

ggplot(new_df, aes(x=scale, y=predicted, color=condition)) +
  geom_point() + # Use points to represent predicted values
  geom_line(aes(group=interaction(scale, condition)), color="grey") + 
  labs(title = "Predicted zs_depth_estimates from Model",
       x = "Scale",
       y = "Predicted zs_depth_estimates") +
  theme_minimal() +
  theme(axis.text.x=element_text(angle=45, hjust=1)) 
ggplot(new_df, aes(x=scale, y=predicted, fill=condition)) +
  geom_col(position=position_dodge(width=0.7), color="black") + # Use bars to represent predicted values
  labs(title = "Predicted zs_depth_estimates from Model",
       x = "Scale",
       y = "Predicted zs_depth_estimates") +
  theme_minimal() +
  theme(axis.text.x=element_text(angle=45, hjust=1), 
        legend.title=element_blank()) + 
  scale_fill_brewer(palette="Pastel1") 


