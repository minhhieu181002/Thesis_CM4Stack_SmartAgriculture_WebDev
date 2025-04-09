import React, { Component } from "react";
import { useState, useEffect, useRef } from "react";

// import "./custom.css";

export const SwipeableButton = ({ onSuccess, onReset }) => {
  // Changed to named export
  const slider = useRef(null);
  const container = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  const isDragging = useRef(false);
  const sliderLeft = useRef(0);
  const unmounted = useRef(false);
  const startX = useRef(null);
  const mainText = useRef(null);
  const containerWidth = useRef(null);

  const isTouchDevice = "ontouchstart" in document.documentElement;

  const handleDrag = (e) => {
    if (unmounted.current || unlocked) return;
    if (isDragging.current) {
      const clientX = isTouchDevice ? e.touches[0].clientX : e.clientX;
      sliderLeft.current = Math.min(
        Math.max(0, clientX - startX.current),
        containerWidth.current
      );
      updateSliderStyle();
    }
  };

  const updateSliderStyle = () => {
    if (unmounted.current || unlocked) return;
    slider.current.style.left = sliderLeft.current + 50 + "px";
    mainText.current.style.left = sliderLeft.current + "px";
  };

  const stopDrag = () => {
    if (unmounted.current || unlocked) return;
    if (isDragging.current) {
      isDragging.current = false;
      let containerW = containerWidth.current * 0.9;
      if (sliderLeft.current > containerW) {
        sliderLeft.current = containerWidth.current;
        handleSuccess();
      } else {
        handleReset();
      }
      updateSliderStyle();
    }
  };

  const handleStartDrag = (e) => {
    if (unmounted.current || unlocked) return;
    isDragging.current = true;
    startX.current = isTouchDevice ? e.touches[0].clientX : e.clientX;
  };

  const handleSuccess = () => {
    container.current.style.width = container.current.clientWidth + "px";
    onSuccess();
    setUnlocked(true);
  };

  const handleReset = () => {
    if (unmounted.current) return;
    setUnlocked(false);
    onReset();
    sliderLeft.current = 0;
  };

  useEffect(() => {
    containerWidth.current = container.current.clientWidth - 50;

    //Need to observe on whole of the screen so as to have reset effect.
    if (isTouchDevice) {
      document.addEventListener("touchmove", handleDrag);
      document.addEventListener("touchend", stopDrag);
    } else {
      document.addEventListener("mousemove", handleDrag);
      document.addEventListener("mouseup", stopDrag);
    }

    return () => {
      // if (isTouchDevice) {
      //   document.removeEventListener("touchmove");
      //   document.removeEventListener("touchend");
      // } else {
      //   document.removeEventListener("mousemove");
      //   document.removeEventListener("mouseup");
      // }
      unmounted.current = true;
    };
  }, []);

  return (
    <div className="ReactSwipeButton">
      <div className="rsbContainer" ref={container}>
        <div
          className="rsbcSlider"
          ref={slider}
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag}
        >
          <span className="rsbcSliderText">Welcome to MEU!</span>
          {unlocked ? (
            <span className="rsbcSliderArrow2"></span>
          ) : (
            <span className="rsbcSliderArrow"></span>
          )}
          <span className="rsbcSliderCircle"></span>
        </div>
        <div className="rsbcText" ref={mainText}>
          Slide into future
        </div>
      </div>
    </div>
  );
};
