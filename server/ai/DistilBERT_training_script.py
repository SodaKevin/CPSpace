import pandas as pd
import torch
import numpy as np
import matplotlib.pyplot as plt

from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments
)

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    ConfusionMatrixDisplay
)

print("CUDA Available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print(torch.cuda.get_device_name(0))

trainDF = pd.read_csv(
    r"C:\Users\kitki\PyCharmMiscProject\FYP distilBERT tuning\train_cleaned.csv",
    encoding="utf-8"
)
#C:\Users\kitki\PyCharmMiscProject\FYP distilBERT tuning\train_cleaned.csv
#C:\Users\kitki\PyCharmMiscProject\FYP distilBERT tuning\train_trial_100.csv

testDF = pd.read_csv(
    r"C:\Users\kitki\PyCharmMiscProject\FYP distilBERT tuning\test_cleaned.csv",
    encoding="utf-8"
)
#C:\Users\kitki\PyCharmMiscProject\FYP distilBERT tuning\test_cleaned.csv
#C:\Users\kitki\PyCharmMiscProject\FYP distilBERT tuning\test_trial_100.csv

assert set(trainDF["labels"].unique()) == {0, 1, 2}
assert set(testDF["labels"].unique()) == {0, 1, 2}

tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")

train_encodings = tokenizer(
    trainDF["text"].tolist(),
    truncation=True,
    padding=True,
    max_length=256
)

test_encodings = tokenizer(
    testDF["text"].tolist(),
    truncation=True,
    padding=True,
    max_length=256
)

class SentimentDataset(torch.utils.data.Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

    def __len__(self):
        return len(self.labels)

train_dataset = SentimentDataset(train_encodings, trainDF["labels"].values)
test_dataset  = SentimentDataset(test_encodings,  testDF["labels"].values)

model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=3
)

print("\n==============================")
print("🚀 TRAINING START")
print("==============================\n")

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=2,
    per_device_train_batch_size=16,
    logging_steps=500,
    save_strategy="no",
    fp16=True,
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset
)

trainer.train()

print("\n==============================")
print("🧪 TESTING / EVALUATION START")
print("==============================\n")

pred_output = trainer.predict(test_dataset)

logits = pred_output.predictions
true_labels = pred_output.label_ids
pred_labels = np.argmax(logits, axis=1)

accuracy  = accuracy_score(true_labels, pred_labels)
precision = precision_score(true_labels, pred_labels, average="macro", zero_division=0)
recall    = recall_score(true_labels, pred_labels, average="macro", zero_division=0)
f1        = f1_score(true_labels, pred_labels, average="macro")

print(f"Accuracy        : {accuracy:.4f}")
print(f"Macro Precision : {precision:.4f}")
print(f"Macro Recall    : {recall:.4f}")
print(f"Macro F1-score  : {f1:.4f}")

cm = confusion_matrix(true_labels, pred_labels)

labels = ["Negative", "Neutral", "Positive"]

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=labels
)

disp.plot(cmap="Blues", values_format="d")
plt.title("Confusion Matrix (Test Set)")
plt.show()

labels = ["Negative", "Neutral", "Positive"]
pd.DataFrame(cm, index=labels, columns=labels)

print("\n💾 Saving trained model...")

trainer.model.save_pretrained("./trained_distilbert_sentiment")
tokenizer.save_pretrained("./trained_distilbert_sentiment")

print("Model saved to ./trained_distilbert_sentiment")
