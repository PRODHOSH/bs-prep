-- Start every note's download count from zero, so the numbers only reflect downloads made on BSPrep.
-- Safe to run more than once. Run it after scripts/025 (or on its own if 025 was already run).
UPDATE public.resources_notes SET downloads = 0 WHERE downloads <> 0;
