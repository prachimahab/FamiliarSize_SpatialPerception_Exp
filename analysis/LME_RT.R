remove.packages("Matrix")
install.packages("Matrix")

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

# Combine the data frames by rows
combined_df <- read.csv('RT_data_for_lme.csv')


combined_df$subjID <- factor(combined_df$subjID)
combined_df$duration <- factor(combined_df$duration)
combined_df$stimulus <- factor(combined_df$stimulus)


mod_main <- lmer(zs_trial_RT ~  scale + condition + duration + scale*condition*duration + (1|zs_actual_depth) + (1|keystrokes), data=combined_df)
summary(mod_main)

# sjPlot:: tab_model(mod_main)

anova(mod_main)

mod_main2 <- lmer(zs_trial_RT ~  zs_actual_depth + scale + condition + duration + zs_actual_depth*scale*condition*duration + (1|subjID) + (1|keystrokes), data=combined_df)
summary(mod_main2)

anova(mod_main2)

mod_main3 <- lmer(zs_trial_RT ~  zs_depth_estimates + scale + condition + duration + zs_depth_estimates*scale*condition*duration + (1|subjID) + (1|keystrokes), data=combined_df)
summary(mod_main3)

anova(mod_main3)

library(effects)
library(lme4)
library(ggplot2)

model_effects <- allEffects(mod_main3)
plot(model_effects)


# Compute the estimated marginal means for scale and condition
emm_scale = emmeans(mod_main2, ~ scale)
emm_condition = emmeans(mod_main2, ~ condition)
emm_duration = emmeans(mod_main2, ~ duration)
emm_AD = emmeans(mod_main2, ~ zs_actual_depth)

# Interaction plot
emm_interaction <- emmeans(mod_main, pairwise ~ scale | condition | zs_actual_depth | duration)
emm_summary <- summary(emm_interaction$emmeans)
emm_df <- as.data.frame(emm_summary)

emm_df$upper <- emm_df$emmean + emm_df$SE
emm_df$lower <- emm_df$emmean - emm_df$SE

write.csv(emm_df, file = "/Users/prachimahableshwarkar/Documents/GW/Depth_MTurk/familiarSize/data/LME_interaction.csv", row.names = FALSE)


ggplot(emm_df, aes(x=interaction(scale, condition), y=emmean, group=condition, color=condition)) +
  geom_bar(stat="identity", position=position_dodge(width=0.8), aes(fill=condition), width=0.7) +
  geom_errorbar(aes(ymin=lower, ymax=upper), position=position_dodge(width=0.8), width=0.25) +
  labs(x="Scale and Condition", y="Estimated Marginal Mean", title="Interaction between Scale and Condition") +
  theme_minimal() +
  theme(axis.text.x=element_text(angle=45, hjust=1), legend.title=element_blank()) +
  scale_fill_brewer(palette="Pastel1") 


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


