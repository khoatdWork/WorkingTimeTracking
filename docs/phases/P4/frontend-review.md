# P4 frontend review

Preserve Design.md palette/font/480px frame and progress circle. Use existing shadcn segmented8/10 controls under the recorded total; show WFH net-hours caption and no timer actions. Reuse same choices in editor, hide datetime inputs, keep request separate. Destructive conversion uses existing AlertDialog, not another page.

Reviewed before implementation against user request: only two hour choices, explicit save result, no auto-start/auto-eight-hour credit. WFH hours are already net; help text makes lunch exception clear. Legacy explanation prevents surprise data replacement.

320px screenshot inspected: readable labels/buttons, no horizontal overflow. Existing5-width/screens/axe suite retained. New WFH screenshots output/playwright/P4, not tracked as source. Physical phone rendering not tested.
