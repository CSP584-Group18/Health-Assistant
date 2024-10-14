# # actions.py
# import logging
# from rasa_sdk import Action
# from rasa_sdk.events import SlotSet

# logger = logging.getLogger(__name__)

# class ActionSuggestMedicine(Action):
    
#     def name(self) -> str:
#         return "action_suggest_medicine"

#     def run(self, dispatcher, tracker, domain):
#         # Get the symptom slot value
#         symptom_slot = tracker.get_slot("symptom")  
#         logger.info(f"Symptom Slot: {symptom_slot}")  # Debug log

#         # Ensure the symptom_slot is treated as a list of symptoms
#         symptoms = [symptom.strip() for symptom in symptom_slot.split(',')] if symptom_slot else []
#         logger.info(f"Processed Symptoms: {symptoms}")  # Debug log to check processed symptoms

#         # Get medicines based on the extracted symptoms
#         medicines = self.get_medicines_for_symptoms(symptoms)

#         if medicines:
#             medicine_list = ", ".join(medicines)
#             message = f"Based on your symptoms, I recommend the following medicines: {medicine_list}. Which one would you like to choose?"
#         else:
#             message = "I'm sorry, I don't have any recommendations for your symptoms."

#         dispatcher.utter_message(text=message)
#         return []

#     def get_medicines_for_symptoms(self, symptoms):
#         # Define a mapping of symptoms to medicines
#         medicine_dict = {
#             "headache": ["Paracetamol", "Ibuprofen", "Aspirin"],
#             "fever": ["Paracetamol", "Ibuprofen"],
#             "nausea": ["Ginger Tablets", "Antacids"],
#             "sore throat": ["Throat Lozenges", "Ginger Tea"],
#             "muscle pain": ["Ibuprofen", "Diclofenac Gel"],
#             "skin rash": ["Hydrocortisone Cream"],
#             "fatigue": ["Vitamin B Complex", "Iron Supplements"],
#             "chest pain": ["Ibuprofen", "Aspirin"]
#         }

#         recommended_medicines = set()  # Use a set to avoid duplicates

#         for symptom in symptoms:
#             if symptom in medicine_dict:
#                 recommended_medicines.update(medicine_dict[symptom])

#         return list(recommended_medicines)

# class ActionConfirmPurchase(Action):
    
#     def name(self) -> str:
#         return "action_confirm_purchase"

#     def run(self, dispatcher, tracker, domain):
#         selected_medicine = tracker.get_slot("medicine")  # Get selected medicine from slot
#         logger.info(f"Selected Medicine: {selected_medicine}")  # Debug log for selected medicine

#         if selected_medicine:
#             dispatcher.utter_message(text=f"{selected_medicine} has been added to your cart. Would you like to purchase anything else?")
#         else:
#             dispatcher.utter_message(text="No medicine was selected.")
#         return []

# class ActionCheckoutTotal(Action):

#     def name(self) -> str:
#         return "action_checkout_total"

#     def run(self, dispatcher, tracker, domain):
#         total_price = 9.99  # Example logic for price calculation
#         dispatcher.utter_message(text=f"Your total is ${total_price}.")
#         return []

import logging
import random
from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet

logger = logging.getLogger(__name__)

class ActionSuggestMedicine(Action):
    def name(self) -> str:
        return "action_suggest_medicine"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        symptom_slot = tracker.get_slot("symptom")
        severity_slot = tracker.get_slot("severity")
        logger.info(f"Symptom Slot: {symptom_slot}")
        logger.info(f"Severity Slot: {severity_slot}")

        if not symptom_slot:
            dispatcher.utter_message(text="I'm sorry, I couldn't understand the symptoms. Can you please describe them again?")
            return []

        if not severity_slot:
            dispatcher.utter_message(text="I'm sorry, I couldn't understand the severity. Can you please specify if it's minor, moderate, or major?")
            return []

        symptoms = [symptom.strip().lower() for symptom in symptom_slot.split(',')]
        severity = severity_slot.lower()
        logger.info(f"Processed Symptoms: {symptoms}")
        logger.info(f"Processed Severity: {severity}")

        medicines = self.get_medicines_for_symptoms(symptoms, severity)
        logger.info(f"Recommended Medicines: {medicines}")

        if medicines:
            medicine_list = ", ".join(medicines)
            message = f"Based on your {severity} symptoms, I recommend the following medicines: {medicine_list}. Which one would you like to choose?"
        else:
            message = "I'm sorry, I don't have any recommendations for your symptoms and severity level."

        dispatcher.utter_message(text=message)
        return []

    def get_medicines_for_symptoms(self, symptoms, severity):
        medicine_dict = {
            "headache": {
                "minor": ["Paracetamol", "Ibuprofen"],
                "moderate": ["Ibuprofen", "Aspirin"],
                "major": ["Sumatriptan", "Rizatriptan"]
            },
            "fever": {
                "minor": ["Paracetamol"],
                "moderate": ["Ibuprofen"],
                "major": ["Aspirin", "Naproxen"]
            },
            "nausea": {
                "minor": ["Ginger Tablets"],
                "moderate": ["Domperidone"],
                "major": ["Ondansetron"]
            },
            "sore throat": {
                "minor": ["Throat Lozenges", "Honey"],
                "moderate": ["Ibuprofen", "Chlorhexidine Gargle"],
                "major": ["Amoxicillin", "Penicillin"]
            },
            "muscle pain": {
                "minor": ["Ibuprofen Gel"],
                "moderate": ["Diclofenac Gel", "Ibuprofen"],
                "major": ["Naproxen", "Celecoxib"]
            },
            "skin rash": {
                "minor": ["Hydrocortisone Cream"],
                "moderate": ["Betamethasone Cream"],
                "major": ["Prednisone", "Antihistamines"]
            },
            "fatigue": {
                "minor": ["Vitamin B Complex"],
                "moderate": ["Iron Supplements", "Vitamin D"],
                "major": ["Consult a doctor for further evaluation"]
            },
            "chest pain": {
                "minor": ["Antacids"],
                "moderate": ["Nitroglycerin"],
                "major": ["Seek immediate medical attention"]
            }
        }

        recommended_medicines = set()

        for symptom in symptoms:
            if symptom in medicine_dict:
                if severity in medicine_dict[symptom]:
                    recommended_medicines.update(medicine_dict[symptom][severity])

        return list(recommended_medicines)

class ActionGetSideEffects(Action):
    def name(self) -> Text:
        return "action_get_side_effects"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        medicine = tracker.get_slot("medicine")
        side_effects = {
            "Paracetamol": "It can cause skin irritation in rare cases.",
            "Ibuprofen": "It may cause stomach upset or gastrointestinal bleeding.",
            "Aspirin": "It can increase the risk of bleeding.",
            "Sumatriptan": "It may cause dizziness or chest tightness.",
            "Rizatriptan": "It can cause drowsiness or nausea.",
            "Domperidone": "It may cause dry mouth or headache.",
            "Ondansetron": "It can cause headache or constipation.",
            "Amoxicillin": "It may cause diarrhea or rash.",
            "Penicillin": "It can cause allergic reactions in some people.",
            "Naproxen": "It may cause stomach upset or dizziness.",
            "Celecoxib": "It can increase the risk of heart attack or stroke.",
            "Prednisone": "It may cause weight gain or mood changes.",
            "Antihistamines": "They can cause drowsiness or dry mouth.",
        }
        
        if medicine in side_effects:
            dispatcher.utter_message(text=f"The side effects of {medicine} are: {side_effects[medicine]}")
        else:
            dispatcher.utter_message(text=f"I'm sorry, I don't have information about the side effects of {medicine}.")
        
        return []

class ActionGetPrice(Action):
    def name(self) -> Text:
        return "action_get_price"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        medicine = tracker.get_slot("medicine")
        prices = {
            "Paracetamol": 5.99,
            "Ibuprofen": 7.99,
            "Aspirin": 6.99,
            "Sumatriptan": 24.99,
            "Rizatriptan": 29.99,
            "Domperidone": 12.99,
            "Ondansetron": 34.99,
            "Amoxicillin": 15.99,
            "Penicillin": 14.99,
            "Naproxen": 9.99,
            "Celecoxib": 39.99,
            "Prednisone": 19.99,
            "Antihistamines": 8.99,
        }
        
        if medicine in prices:
            dispatcher.utter_message(text=f"The price of {medicine} is ${prices[medicine]:.2f}")
        else:
            dispatcher.utter_message(text=f"I'm sorry, I don't have pricing information for {medicine}.")
        
        return []

class ActionConfirmPurchase(Action):
    def name(self) -> str:
        return "action_confirm_purchase"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        selected_medicine = tracker.get_slot("medicine")
        logger.info(f"Selected Medicine: {selected_medicine}")

        if selected_medicine:
            dispatcher.utter_message(text=f"{selected_medicine} has been added to your cart. Would you like to purchase anything else?")
        else:
            dispatcher.utter_message(text="No medicine was selected.")
        return []

class ActionProcessOrder(Action):
    def name(self) -> Text:
        return "action_process_order"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        order_id = f"ORD{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=6))}"
        dispatcher.utter_message(text=f"Thank you for your order. Your order ID is {order_id}.")
        return [SlotSet("order_id", order_id)]

class ActionCheckoutTotal(Action):
    def name(self) -> str:
        return "action_checkout_total"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        total_price = 9.99  # Example logic for price calculation
        dispatcher.utter_message(text=f"Your total is ${total_price:.2f}.")
        return []