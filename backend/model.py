"""
Crop Health & Disease Diagnostic App - Model Training
This script trains a deep learning model using transfer learning with MobileNetV2
"""

import os
import json
import numpy as np
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 3  # Can be increased for better accuracy
DATA_DIR = 'PlantVillage'

print("=" * 60)
print("CROP HEALTH & DISEASE DIAGNOSTIC - MODEL TRAINING")
print("=" * 60)

# Step 1: Data Preparation
print("\n[1/5] Preparing data generators...")

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    validation_split=0.2,
    zoom_range=0.2,
    shear_range=0.2
)

# Training data
train_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

# Validation data
validation_generator = train_datagen.flow_from_directory(
    DATA_DIR,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

num_classes = len(train_generator.class_indices)
class_names = list(train_generator.class_indices.keys())

print(f"✓ Found {num_classes} disease classes")
print(f"✓ Training samples: {train_generator.samples}")
print(f"✓ Validation samples: {validation_generator.samples}")

# Step 2: Build Model Architecture
print("\n[2/5] Building model architecture...")

# Load pre-trained MobileNetV2 (without top layer)
base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

# Freeze base model layers for transfer learning
base_model.trainable = False

# Add custom classification layers
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.3)(x)
predictions = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

print("✓ Model architecture created")
print(f"✓ Base model: MobileNetV2 (pre-trained on ImageNet)")
print(f"✓ Output classes: {num_classes}")

# Step 3: Compile Model
print("\n[3/5] Compiling model...")

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("✓ Model compiled with Adam optimizer")

# Step 4: Train Model
print("\n[4/5] Training model...")
print(f"Training for {EPOCHS} epochs...")

callbacks = [
    EarlyStopping(
        monitor='val_loss',
        patience=3,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=2,
        verbose=1
    )
]

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=callbacks,
    verbose=1
)

print("\n✓ Training completed!")

# Step 5: Save Model and Class Names
print("\n[5/5] Saving model and metadata...")

# Save the trained model
model.save('plant_disease_model.h5')
print("✓ Model saved as 'plant_disease_model.h5'")

# Save class names for prediction mapping
with open('class_names.json', 'w') as f:
    json.dump(class_names, f, indent=2)
print("✓ Class names saved as 'class_names.json'")

# Display final metrics
final_train_acc = history.history['accuracy'][-1]
final_val_acc = history.history['val_accuracy'][-1]

print("\n" + "=" * 60)
print("TRAINING SUMMARY")
print("=" * 60)
print(f"Final Training Accuracy:   {final_train_acc*100:.2f}%")
print(f"Final Validation Accuracy: {final_val_acc*100:.2f}%")
print(f"Total Classes: {num_classes}")
print("\nModel is ready for deployment!")
print("=" * 60)