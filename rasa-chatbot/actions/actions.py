# actions.py
import logging
from rasa_sdk import Action
from rasa_sdk.events import SlotSet

logger = logging.getLogger(__name__)

class ActionSuggestMedicine(Action):
    
    def name(self) -> str:
        return "action_suggest_medicine"

    def run(self, dispatcher, tracker, domain):
        # Get the symptom slot value
        symptom_slot = tracker.get_slot("symptom")  
        logger.info(f"Symptom Slot: {symptom_slot}")  # Debug log

        # Ensure the symptom_slot is treated as a list of symptoms
        symptoms = [symptom.strip() for symptom in symptom_slot.split(',')] if symptom_slot else []
        logger.info(f"Processed Symptoms: {symptoms}")  # Debug log to check processed symptoms

        # Get medicines based on the extracted symptoms
        medicines = self.get_medicines_for_symptoms(symptoms)

        if medicines:
            medicine_list = ", ".join(medicines)
            message = f"Based on your symptoms, I recommend the following medicines: {medicine_list}. Which one would you like to choose?"
        else:
            message = "I'm sorry, I don't have any recommendations for your symptoms."

        dispatcher.utter_message(text=message)
        return []

    def get_medicines_for_symptoms(self, symptoms):
        # Define a mapping of symptoms to medicines
        medicine_dict = {
            "headache": ["Paracetamol", "Ibuprofen", "Aspirin"],
            "fever": ["Paracetamol", "Ibuprofen"],
            "nausea": ["Ginger Tablets", "Antacids"],
            "sore throat": ["Throat Lozenges", "Ginger Tea"],
            "muscle pain": ["Ibuprofen", "Diclofenac Gel"],
            "skin rash": ["Hydrocortisone Cream"],
            "fatigue": ["Vitamin B Complex", "Iron Supplements"],
            "chest pain": ["Ibuprofen", "Aspirin"]
        }

        recommended_medicines = set()  # Use a set to avoid duplicates

        for symptom in symptoms:
            if symptom in medicine_dict:
                recommended_medicines.update(medicine_dict[symptom])

        return list(recommended_medicines)

class ActionConfirmPurchase(Action):
    
    def name(self) -> str:
        return "action_confirm_purchase"

    def run(self, dispatcher, tracker, domain):
        selected_medicine = tracker.get_slot("medicine")  # Get selected medicine from slot
        logger.info(f"Selected Medicine: {selected_medicine}")  # Debug log for selected medicine

        if selected_medicine:
            dispatcher.utter_message(text=f"{selected_medicine} has been added to your cart. Would you like to purchase anything else?")
        else:
            dispatcher.utter_message(text="No medicine was selected.")
        return []

class ActionCheckoutTotal(Action):

    def name(self) -> str:
        return "action_checkout_total"

    def run(self, dispatcher, tracker, domain):
        total_price = 9.99  # Example logic for price calculation
        dispatcher.utter_message(text=f"Your total is ${total_price}.")
        return []
