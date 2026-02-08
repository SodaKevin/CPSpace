from datasets import load_dataset

ds = load_dataset("prasadsawant7/sentiment_analysis_preprocessed_dataset")

ds["train"].to_csv("train.csv", index=False)
ds["validation"].to_csv("val.csv", index=False)
ds["test"].to_csv("test.csv", index=False)
