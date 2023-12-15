#ifndef LIBWIIGUI_ELEMENT_H
#define LIBWIIGUI_ELEMENT_H

//!Primary GUI class. Most other classes inherit from this class.
class GuiElement {
public:
	//!Constructor
	GuiElement();
	//!Destructor
	virtual ~GuiElement();
	//!Set the element's parent
	//!\param e Pointer to parent element
	void SetParent(GuiElement * e);
	//!Gets the element's parent
	//!\return Pointer to parent element
	GuiElement * GetParent();
	//!Gets the current leftmost coordinate of the element
	//!Considers horizontal alignment, x offset, width, and parent element's GetLeft() / GetWidth() values
	//!\return left coordinate
	int GetLeft();
	//!Gets the current topmost coordinate of the element
	//!Considers vertical alignment, y offset, height, and parent element's GetTop() / GetHeight() values
	//!\return top coordinate
	int GetTop();
	//!Sets the minimum y offset of the element
	//!\param y Y offset
	void SetMinY(int y);
	//!Gets the minimum y offset of the element
	//!\return Minimum Y offset
	int GetMinY();
	//!Sets the maximum y offset of the element
	//!\param y Y offset
	void SetMaxY(int y);
	//!Gets the maximum y offset of the element
	//!\return Maximum Y offset
	int GetMaxY();
	//!Sets the minimum x offset of the element
	//!\param x X offset
	void SetMinX(int x);
	//!Gets the minimum x offset of the element
	//!\return Minimum X offset
	int GetMinX();
	//!Sets the maximum x offset of the element
	//!\param x X offset
	void SetMaxX(int x);
	//!Gets the maximum x offset of the element
	//!\return Maximum X offset
	int GetMaxX();
	//!Gets the current width of the element. Does not currently consider the scale
	//!\return width
	int GetWidth();
	//!Gets the height of the element. Does not currently consider the scale
	//!\return height
	int GetHeight();
	//!Sets the size (width/height) of the element
	//!\param w Width of element
	//!\param h Height of element
	void SetSize(int w, int h);
	//!Checks whether or not the element is visible
	//!\return true if visible, false otherwise
	bool IsVisible();
	//!Checks whether or not the element is selectable
	//!\return true if selectable, false otherwise
	bool IsSelectable();
	//!Checks whether or not the element is clickable
	//!\return true if clickable, false otherwise
	bool IsClickable();
	//!Checks whether or not the element is holdable
	//!\return true if holdable, false otherwise
	bool IsHoldable();
	//!Sets whether or not the element is selectable
	//!\param s Selectable
	void SetSelectable(bool s);
	//!Sets whether or not the element is clickable
	//!\param c Clickable
	void SetClickable(bool c);
	//!Sets whether or not the element is holdable
	//!\param h Holdable
	void SetHoldable(bool h);
	//!Gets the element's current state
	//!\return state
	STATE GetState();
	//!Gets the controller channel that last changed the element's state
	//!\return Channel number (0-3, -1 = no channel)
	int GetStateChan();
	//!Sets the element's alpha value
	//!\param a alpha value
	void SetAlpha(int a);
	//!Gets the element's alpha value
	//!Considers alpha, alphaDyn, and the parent element's GetAlpha() value
	//!\return alpha
	int GetAlpha();
	//!Sets the element's x and y scale
	//!\param s scale (1 is 100%)
	void SetScale(float s);
	//!Sets the element's x scale
	//!\param s scale (1 is 100%)
	void SetScaleX(float s);
	//!Sets the element's y scale
	//!\param s scale (1 is 100%)
	void SetScaleY(float s);
	//!Sets the element's x and y scale, using the provided max width/height
	//!\param w Maximum width
	//!\param h Maximum height
	void SetScale(int w, int h);
	//!Gets the element's current scale
	//!Considers scale, scaleDyn, and the parent element's GetScale() value
	float GetScale();
	//!Gets the element's current x scale
	//!Considers scale, scaleDyn, and the parent element's GetScale() value
	float GetScaleX();
	//!Gets the element's current y scale
	//!Considers scale, scaleDyn, and the parent element's GetScale() value
	float GetScaleY();
	//!Set a new GuiTrigger for the element
	//!\param t Pointer to GuiTrigger
	void SetTrigger(GuiTrigger * t);
	//!\overload
	//!\param i Index of trigger array to set
	//!\param t Pointer to GuiTrigger
	void SetTrigger(u8 i, GuiTrigger * t);
	//!Checks whether rumble was requested by the element
	//!\return true is rumble was requested, false otherwise
	bool Rumble();
	//!Sets whether or not the element is requesting a rumble event
	//!\param r true if requesting rumble, false if not
	void SetRumble(bool r);
	//!Set an effect for the element
	//!\param e Effect to enable
	//!\param a Amount of the effect (usage varies on effect)
	//!\param t Target amount of the effect (usage varies on effect)
	void SetEffect(int e, int a, int t = 0);
	//!Sets an effect to be enabled on wiimote cursor over
	//!\param e Effect to enable
	//!\param a Amount of the effect (usage varies on effect)
	//!\param t Target amount of the effect (usage varies on effect)
	void SetEffectOnOver(int e, int a, int t = 0);
	//!Shortcut to SetEffectOnOver(EFFECT_SCALE, 4, 110)
	void SetEffectGrow();
	//!Gets the current element effects
	//!\return element effects
	int GetEffect();
	//!Checks whether the specified coordinates are within the element's boundaries
	//!\param x X coordinate
	//!\param y Y coordinate
	//!\return true if contained within, false otherwise
	bool IsInside(int x, int y);
	//!Sets the element's position
	//!\param x X coordinate
	//!\param y Y coordinate
	void SetPosition(int x, int y);
	//!Updates the element's effects (dynamic values)
	//!Called by Draw(), used for animation purposes
	void UpdateEffects();
	//!Sets a function to called after after Update()
	//!Callback function can be used to response to changes in the state of the element, and/or update the element's attributes
	void SetUpdateCallback(UpdateCallback u);
	//!Checks whether the element is in focus
	//!\return true if element is in focus, false otherwise
	int IsFocused();
	//!Sets the element's visibility
	//!\param v Visibility (true = visible)
	virtual void SetVisible(bool v);
	//!Sets the element's focus
	//!\param f Focus (true = in focus)
	virtual void SetFocus(int f);
	//!Sets the element's state
	//!\param s State (STATE::DEFAULT, STATE::SELECTED, STATE::CLICKED, STATE::DISABLED)
	//!\param c Controller channel (0-3, -1 = none)
	virtual void SetState(STATE s, int c = -1);
	//!Resets the element's state to STATE::DEFAULT
	virtual void ResetState();
	//!Gets whether or not the element is in STATE::SELECTED
	//!\return true if selected, false otherwise
	virtual int GetSelected();
	//!Sets the element's alignment respective to its parent element
	//!\param hor Horizontal alignment (LEFT, RIGHT, CENTRE)
	//!\param vert Vertical alignment (TOP, BOTTOM, MIDDLE)
	virtual void SetAlignment(ALIGN_H hor, ALIGN_V vert);
	//!Called when the language has changed, to obtain new text values for all text elements
	virtual void ResetText();
	//!Called constantly to allow the element to respond to the current input data
	//!\param t Pointer to a GuiTrigger, containing the current input data from PAD/WPAD
	virtual void Update(GuiTrigger * t);
	//!Called constantly to redraw the element
	virtual void Draw();
	//!Called constantly to redraw the element's tooltip
	virtual void DrawTooltip();
protected:
	GuiTrigger * trigger[3]; //!< GuiTriggers (input actions) that this element responds to
	UpdateCallback updateCB; //!< Callback function to call when this element is updated
	GuiElement * parentElement; //!< Parent element
	int focus; //!< Element focus (-1 = focus disabled, 0 = not focused, 1 = focused)
	int width; //!< Element width
	int height; //!< Element height
	int xoffset; //!< Element X offset
	int yoffset; //!< Element Y offset
	int ymin; //!< Element's min Y offset allowed
	int ymax; //!< Element's max Y offset allowed
	int xmin; //!< Element's min X offset allowed
	int xmax; //!< Element's max X offset allowed
	int xoffsetDyn; //!< Element X offset, dynamic (added to xoffset value for animation effects)
	int yoffsetDyn; //!< Element Y offset, dynamic (added to yoffset value for animation effects)
	int alpha; //!< Element alpha value (0-255)
	int alphaDyn; //!< Element alpha, dynamic (multiplied by alpha value for blending/fading effects)
	f32 xscale; //!< Element X scale (1 = 100%)
	f32 yscale; //!< Element Y scale (1 = 100%)
	f32 scaleDyn; //!< Element scale, dynamic (multiplied by alpha value for blending/fading effects)
	int effects; //!< Currently enabled effect(s). 0 when no effects are enabled
	int effectAmount; //!< Effect amount. Used by different effects for different purposes
	int effectTarget; //!< Effect target amount. Used by different effects for different purposes
	int effectsOver; //!< Effects to enable when wiimote cursor is over this element. Copied to effects variable on over event
	int effectAmountOver; //!< EffectAmount to set when wiimote cursor is over this element
	int effectTargetOver; //!< EffectTarget to set when wiimote cursor is over this element
	ALIGN_H alignmentHor; //!< Horizontal element alignment, respective to parent element (LEFT, RIGHT, CENTRE)
	ALIGN_V alignmentVert; //!< Horizontal element alignment, respective to parent element (TOP, BOTTOM, MIDDLE)
	STATE state; //!< Element state (DEFAULT, SELECTED, CLICKED, DISABLED)
	int stateChan; //!< Which controller channel is responsible for the last change in state
	bool selectable; //!< Whether or not this element selectable (can change to SELECTED state)
	bool clickable; //!< Whether or not this element is clickable (can change to CLICKED state)
	bool holdable; //!< Whether or not this element is holdable (can change to HELD state)
	bool visible; //!< Visibility of the element. If false, Draw() is skipped
	bool rumble; //!< Wiimote rumble (on/off) - set to on when this element requests a rumble event
};

#endif
